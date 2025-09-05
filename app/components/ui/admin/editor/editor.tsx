import {useEffect, useRef, useState} from 'react'
import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertImage,
  InsertCodeBlock,
  MDXEditor,
  type MDXEditorMethods,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export const Editor = ({data}: {data?: string}) => {
  const markdown = data || ''
  const originalMarkdown = useRef(markdown)
  const ref = useRef<MDXEditorMethods>(null)
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState(markdown)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (value: string) => {
    try {
      setContent(value)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  if (!mounted) return null

  return (
    <>
      <MDXEditor
        ref={ref}
        markdown={markdown}
        contentEditableClassName="prose text-editor"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          codeBlockPlugin({defaultCodeBlockLanguage: ''}),
          codeMirrorPlugin({
            codeBlockLanguages: {
              '': 'Plain text',
              css: 'CSS',
              html: 'HTML',
              js: 'JavaScript',
              jsx: 'JSX',
              ts: 'TypeScript',
              tsx: 'TSX',
              python: 'Python',
              bash: 'Bash',
              json: 'JSON'
            }
          }),
          linkPlugin(),
          thematicBreakPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          diffSourcePlugin({
            viewMode: 'rich-text',
            readOnlyDiff: false,
            diffMarkdown: originalMarkdown.current,
          }),
          toolbarPlugin({
            toolbarClassName: 'mdx-toolbar',
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <InsertCodeBlock />
                <CreateLink />
                <InsertImage />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
        onChange={handleChange}
      />
      {error && (
        <div style={{ color: 'red', marginTop: '8px', fontSize: '14px' }}>
          Error: {error}
        </div>
      )}
      <input type="hidden" name="content" value={content} />
    </>
  )
}
