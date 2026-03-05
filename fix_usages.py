import re
import glob

def refactor_file(file):
    with open(file, 'r') as f:
        content = f.read()

    # Find patterns like:  var_name = await get_something_dal()
    # It could be single line or surrounded by code.
    # We will change the whole function logic or we can just replace the specific uses...
    # Wait, simple regex won't work easily if they are used multiple times in same scope.
    pass

