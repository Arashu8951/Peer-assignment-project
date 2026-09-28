export type ViewerComment = { lineNumber: number; body: string; reviewerName: string };

// Code is rendered as text nodes, so React escapes it. Never inject it as HTML.
export function CodeViewer({ code, comments = [] }: { code: string; comments?: ViewerComment[] }) {
  const lines = code.split("\n");
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse font-mono text-sm">
        <tbody>
          {lines.map((line, i) => {
            const n = i + 1;
            const here = comments.filter((c) => c.lineNumber === n);
            return (
              <Line key={n} n={n} text={line} highlighted={here.length > 0}>
                {here.map((c, k) => (
                  <p key={k} className="font-sans text-sm text-slate-800">
                    <span className="font-semibold">{c.reviewerName}:</span> {c.body}
                  </p>
                ))}
              </Line>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Line({
  n,
  text,
  highlighted,
  children,
}: {
  n: number;
  text: string;
  highlighted: boolean;
  children: React.ReactNode[];
}) {
  return (
    <>
      <tr className={highlighted ? "bg-amber-50" : undefined}>
        <td className="w-12 select-none border-r border-slate-200 px-3 text-right align-top text-slate-400">{n}</td>
        <td className="px-3">
          <pre className="whitespace-pre">{text || " "}</pre>
        </td>
      </tr>
      {children.length > 0 && (
        <tr>
          <td className="border-r border-slate-200" />
          <td className="space-y-1 border-y border-amber-200 bg-amber-50/60 px-3 py-2">{children}</td>
        </tr>
      )}
    </>
  );
}
