/** The controls: a picker, a slider, a toggle, each a labelled row. */

export function picker(label: string, options: Array<string | { value: string; label: string }>, value: string, onChange: (v: string) => void): HTMLLabelElement {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<span>${label}</span>`;
  const sel = document.createElement('select');
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = typeof o === 'string' ? o : o.value;
    opt.textContent = typeof o === 'string' ? o : o.label;
    sel.append(opt);
  }
  sel.value = value;
  sel.addEventListener('change', () => onChange(sel.value));
  wrap.append(row, sel);
  return wrap;
}

export function slider(label: string, min: number, max: number, step: number, value: number, show: (v: number) => string, onChange: (v: number) => void): HTMLLabelElement & { set: (v: number) => void } {
  const wrap = document.createElement('label') as HTMLLabelElement & { set: (v: number) => void };
  wrap.className = 'field';
  const row = document.createElement('div');
  row.className = 'row';
  const name = document.createElement('span');
  name.textContent = label;
  const out = document.createElement('b');
  out.textContent = show(value);
  row.append(name, out);
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener('input', () => {
    const v = Number(input.value);
    out.textContent = show(v);
    onChange(v);
  });
  wrap.append(row, input);
  wrap.set = (v: number) => { input.value = String(v); out.textContent = show(v); };
  return wrap;
}

export function toggle(label: string, value: boolean, onChange: (v: boolean) => void): HTMLLabelElement {
  const wrap = document.createElement('label');
  wrap.className = 'check';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = value;
  input.addEventListener('change', () => onChange(input.checked));
  wrap.append(input, document.createTextNode(label));
  return wrap;
}

export function section(title: string, ...children: Element[]): HTMLFieldSetElement {
  const set = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = title;
  set.append(legend, ...children);
  return set;
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
