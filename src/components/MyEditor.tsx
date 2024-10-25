import React from "react";
import Editor from "@components/Editor.jsx";

import prism from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another

const { highlight, languages } = prism;

export default function MyEditor({ initialCode }: { initialCode: string }) {
  const [code, setCode] = React.useState(
    initialCode ?? `function add(a, b) {\n  return a + b;\n}`
  );
  const [stderr, setStderr] = React.useState("");
  const [stdout, setStdout] = React.useState("");
  const [output, setOutput] = React.useState(undefined);

  function checkCode() {
    fetch("/api/compile-check", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        code,
      }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then((data) => {
        setStderr(data.stderr);
        setStdout(data.stdout);
        setOutput(data.value);
      })
      .catch((err) => {
        setStderr(err.toString())});
  }

  return (
    <div>
      <Editor
        value={code}
        onValueChange={setCode}
        highlight={(code: string) => highlight(code, languages.js)}
      />
      <button onClick={checkCode}>Submit</button>
      <h1>Output</h1>
      <p className="out">{output}</p>
      <h1>stderr</h1>
      <p className="out">{stderr}</p>
      <h1>stdout</h1>
      <p className="out">{stdout}</p>
    </div>
  );
}
