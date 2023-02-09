#! /usr/bin/env python3

from os import listdir
from os.path import isfile, join

testdirs = [f for f in listdir(
    "test-pages") if not isfile(join("test-pages", f))]

print("""
<!DOCTYPE html>
<html>

  <head>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
  </head>

   <body>

<table style="width: 100%">
<tr>
<td valign="top" style="width: 250px">
    <ul>
""")

for testdir in testdirs:
    print(f"""
      <li>{testdir}<br />
        <a href="./test-pages/{testdir}/source.html" target="iframe_b">[source]</a>
        <a href="./test-pages/{testdir}/expected.html" target="iframe_b">[readability]</a>
        <a href="./test-pages/{testdir}/distiller.html" target="iframe_b">[dom-distiller]</a>
      </li>
  """)


print("""
    </ul>
  </td>
<td valign="top">
<iframe name="iframe_b" frameborder="1" scrolling="yes" width="100%" height="1080">
  <p>Your browser does not support iframes.</p>
</iframe>
</td>
</tr>
</table>
</body>

</html>
""")
