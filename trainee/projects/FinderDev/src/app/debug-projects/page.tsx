import { getProjects } from "@/app/actions/projects";

export default async function DebugProjectsPage() {
    const result = await getProjects({ limit: "50" });

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Debug Projects</h1>
            <div className="bg-slate-900 text-green-400 p-4 rounded overflow-auto max-h-[80vh]">
                <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
        </div>
    );
}
