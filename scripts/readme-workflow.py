"""Regenerate README workflow illustrations (requires Node, Excalidraw CLI and Pillow)."""
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'docs' / 'images'
LABELS = [('理解需求', '明确问题与知识模型'), ('设计图示', '选择场景与表达方式'),
          ('生成画布', '转换并渲染可编辑图'), ('检查交付', '检查预览并交付结果')]

def source(active):
    lines = ['flowchart LR']
    for i, (title, detail) in enumerate(LABELS):
        lines.append(f'  n{i}["{i+1}. {title}<br/>{detail}"]')
    lines += ['  n0 --> n1 --> n2 --> n3',
              '  classDef normal fill:#f7f6f2,stroke:#c5c4bd,color:#4b5563;',
              '  classDef active fill:#e3f1ff,stroke:#4c8ddb,color:#243447;',
              '  classDef done fill:#e4f4e8,stroke:#65ad7b,color:#243447;']
    for i in range(len(LABELS)):
        style = 'done' if active == 4 or i < active else 'active' if i == active else 'normal'
        lines.append(f'  class n{i} {style};')
    return '\n'.join(lines) + '\n'

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    frames = []
    with tempfile.TemporaryDirectory(prefix='sketchmind-readme-') as temp:
        temp = Path(temp)
        for i in range(5):
            src = temp / f'frame-{i}.mmd'
            src.write_text(source(i), encoding='utf-8')
            subprocess.run(['node', str(ROOT / 'scripts' / 'excalidraw.mjs'), 'build', str(src),
                            '--out', str(temp / f'frame-{i}')], check=True, stdout=subprocess.DEVNULL)
            with Image.open(temp / f'frame-{i}.png') as im:
                frames.append(im.convert('RGB'))
        shutil.copyfile(temp / 'frame-4.excalidraw', DEST / 'workflow.excalidraw')
        if len({frame.size for frame in frames}) != 1:
            raise RuntimeError('Workflow frame dimensions differ; animation cannot be aligned.')
        frames[-1].save(DEST / 'workflow.png', optimize=True)
        frames[0].save(DEST / 'workflow.gif', save_all=True, append_images=frames[1:],
                       duration=[1400, 1400, 1400, 1400, 2500], loop=0, optimize=True, disposal=2)
    (DEST / 'workflow.mmd').write_text(source(4), encoding='utf-8')

if __name__ == '__main__':
    main()
