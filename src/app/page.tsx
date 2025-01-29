import Link from 'next/link'

export default function Home() {
  return (
    <article className="p-10 container flex items-center h-screen font-roboto-mono lowercase">
      <div>
        <p>Hellos.</p>
        <br/>
        <p>I&apos;m a full-stack developer, self-taught and deeply influenced by my practice as an artist, still driven by the goal of using creative mediums to tell stories and challenge perspective.</p>
        <br/>
        <p>Projects I am currently working on:</p>
        <ul className="project-list">
          <li><Link href="https://www.art.sumitsute.com/">- art portfolio</Link></li>
          <li></li>
        </ul>
      </div>
    </article>
  );
}
