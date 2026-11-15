// Renders $inline$ and $$display$$ maths to KaTeX HTML at build time,
// as a Sätteri mdast plugin (Astro 7's default Markdown processor).
import katex from 'katex';
import { defineMdastPlugin } from 'satteri';

const render = (tex, displayMode) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, output: 'html' });

export const katexPlugin = defineMdastPlugin({
  name: 'katex',
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: render(node.value, false) });
  },
  math(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: render(node.value, true) });
  },
});
