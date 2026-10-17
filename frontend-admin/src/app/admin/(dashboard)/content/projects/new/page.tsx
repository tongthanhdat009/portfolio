import ProjectEditorClient from '../ProjectEditorClient';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  return <ProjectEditorClient isNew={true} />;
}
