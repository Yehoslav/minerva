import React, { useState } from 'react';
import Editor from '@components/Editor.jsx';

import prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

const { highlight, languages } = prism;

export default function MyEditor({ initialCode }: { initialCode: string }) {
    const [code, setCode] = React.useState(
        initialCode ?? `function add(a, b) {\n  return a + b;\n}`,
    );
    const [stderr, setStderr] = React.useState('');
    const [stdout, setStdout] = React.useState('');
    const [errKind, setErrKind] = React.useState(undefined);
    const [active, setActive] = useState<'stdout' | 'stderr'>('stdout');

    function checkCode() {
        fetch('/api/compile', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
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
                setStderr(data.stderr ?? "");
                setStdout(data.stdout ?? "");
                setErrKind(data.err_kind);
                if (data.err_kind === 'none') {
                    setActive('stdout');
                } else {
                    setActive('stderr');
                }
            })
            .catch((err) => {
                console.log('The error is:');
                console.dir(err);
                setStderr(err.toString());
            });
    }

    return (
        <div>
            <div style={{margin: "0.4rem 0"}}>
                <Editor
                    padding={10}
                    preClassName='codearea'
                    tabSize={4}
                    value={code}
                    onValueChange={setCode}
                    highlight={(code: string) => highlight(code, languages.js)}
                />
            </div>
            <button onClick={checkCode}>Submit</button>

            <div>
                <button
                    style={{
                        padding: '0.7rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: active === 'stderr' ? '2px solid green' : 'none',
                    }}
                    onClick={() => setActive('stderr')}
                >
                    stderr
                    {stderr !== '' && (
                        <span
                            style={{
                                padding: '0.3rem',
                                background: 'cyan',
                                color: 'red',
                            }}
                        >
                            !
                        </span>
                    )}
                </button>
                <button
                    style={{
                        padding: '0.7rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: active === 'stdout' ? '2px solid green' : 'none',
                    }}
                    onClick={() => setActive('stdout')}>
                    stdout
                    {stdout !== '' && (
                        <span
                            style={{
                                padding: '0.5rem',
                                background: 'cyan',
                                color: 'red',
                            }}
                        >
                            !
                        </span>
                    )}
                </button>
            </div>

            <div>
                {active === 'stdout' && <p className="out">{stdout}</p>}
                {active === 'stderr' && <p className="out">{stderr}</p>}
            </div>
        </div>
    );
}
