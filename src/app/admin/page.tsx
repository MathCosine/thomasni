import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getAllPosts } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { LoginForm } from "@/components/LoginForm";
import { LogoutButton } from "@/components/LogoutButton";
import { DeletePostButton } from "@/components/DeletePostButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Write",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <div className="page">
        <LoginForm />
      </div>
    );
  }

  const posts = getAllPosts();

  return (
    <div className="page wide">
      <div className="admin-head">
        <h1>The writing desk</h1>
        <div className="row" style={{ alignItems: "center", flex: "0 0 auto" }}>
          <Link className="btn" href="/admin/new">
            New post
          </Link>
          <LogoutButton />
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="lede">Nothing written yet. Start with a new post.</p>
      ) : (
        <ul className="admin-list">
          {posts.map((p) => (
            <li className="admin-row" key={p.id}>
              <div>
                <div className="t">
                  {p.title}{" "}
                  {p.published ? (
                    <span className="badge live">Published</span>
                  ) : (
                    <span className="badge draft">Draft</span>
                  )}
                </div>
                <div className="sub">
                  {formatDate(p.created_at)} · ♥ {p.heart_count} · {p.comment_count} comment
                  {p.comment_count === 1 ? "" : "s"}
                </div>
              </div>
              <div className="actions">
                {p.published && <Link href={`/posts/${p.slug}`}>View</Link>}
                <Link href={`/admin/edit/${p.id}`}>Edit</Link>
                <DeletePostButton id={p.id} title={p.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
