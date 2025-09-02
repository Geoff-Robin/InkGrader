import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, TrendingUp, Wifi, WifiOff } from "lucide-react";

type ExamInfo = {
    file_name: string;
    total_marks: number;
}

const ExamPage = () => {
  const { exam_id } = useParams();
  const [examInfoList, setExamInfoList] = useState<ExamInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/exam/${exam_id}`);
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setExamInfoList((prev) => [...prev, data.update]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
    
    return () => {
      socket.close();
    };
  }, [exam_id]);

  const totalMarks = examInfoList.reduce((sum, exam) => sum + exam.total_marks, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Exam
            </h1>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          {!isConnected && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                WebSocket connection lost. Please check your connection and refresh the page.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{examInfoList.length}</div>
              <p className="text-xs text-muted-foreground">
                Exam files received
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Exam Files List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exam Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examInfoList.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No exam files available
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Waiting for exam data...' : 'Please check your connection'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {examInfoList.map((examInfo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{examInfo.file_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          File #{index + 1}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                        {examInfo.total_marks} marks
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamPage;