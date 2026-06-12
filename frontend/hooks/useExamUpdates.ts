import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const GATEWAY_WS_URL = process.env.NEXT_PUBLIC_GATEWAY_WS_URL || "ws://localhost:8001";

export function useExamUpdates(examId: string | string[] | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!examId || Array.isArray(examId)) return;

        let socket: WebSocket;
        let reconnectTimer: ReturnType<typeof setTimeout>;
        let closedByEffect = false;
        let attempt = 0;

        const connect = () => {
            socket = new WebSocket(`${GATEWAY_WS_URL}/ws/exam/${examId}`);

            socket.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.exam_id) {
                        queryClient.invalidateQueries({ queryKey: ["exam-students", payload.exam_id] });
                    }
                } catch {
                    // ignore malformed messages
                }
            };

            socket.onclose = () => {
                if (closedByEffect) return;
                attempt += 1;
                const delay = Math.min(1000 * 2 ** attempt, 30000);
                reconnectTimer = setTimeout(connect, delay);
            };
        };

        connect();

        return () => {
            closedByEffect = true;
            clearTimeout(reconnectTimer);
            socket?.close();
        };
    }, [examId, queryClient]);
}
