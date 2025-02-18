'use client'

import FallingLeaves from "../components/specific/FallingLeaves";


export default function Home() {
  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="h-[calc(100vh-10rem)]">
        <div className=''>
          <p className="font-bold">About</p>
        </div>
        <br/>
        <p>Before finding my rightful place in web development, my path has taken me through mechanical engineering, documentary photography, editorial journalism, communication strategy, and community organizing. A common thread runs through all these experiences: the drive to create things that enhance and complement life.</p>
        <br/> 
        <p className="inline">Building backwards and retracing every step that led me here.</p><div className="inline"><FallingLeaves /></div>
        <ul className='life-line project-list p-2 pb-10'>
          <li>Reimagined my lens-based visual art (photo objects) as web experiences, bridging the personal and the political.</li>
          <li>Developed Dramas of Discrimination, a web application facilitating workshops for diverse communities, integrating systems thinking and Theatre of the Oppressed methodologies.</li>
          <li>Married Pallavi, the love of my life. We have four kids now.</li>
          <li>Awarded the Mirror&apos;s Fellowship for creative expressions on the (de)construction of masculinity.</li>
          <li>Represented Ambedkar Reading Circle (arc) at the Second Global Conference on Caste, Business, and Society at the University of Bath, UK.</li>
          <li>Took a sabbatical to care for my mother during a health relapse—began coding at her hospital bedside.</li>
          <li>Contributed to &apos;All That Blue&apos; magazine, curating anti-caste creative expressions from India.</li>
          <li>Initiated community organizing and program design at the Ambedkar Reading Circle, making anti-caste philosophy and literature more accessible in public spaces.</li>
          <li>Exhibited at the Vannam Photo Festival in Chennai.</li>
          <li>Moved to Bangalore to work as a communication strategist at a games for public policy startup.</li>
          <li>Took a sabbatical to care for my mother, deepening my relationship with my father.</li>
          <li>Relocated to New Delhi to work as a photo editor at Hindustan Times.</li>
          <li>Worked as a documentary photographer for governmental and non-governmental organizations, including the Maharashtra Government, Paani Foundation, Indian Institute of Human Settlements, and The Wire, covering rural and urban stories across Maharashtra, Gujarat, and Karnataka.</li>
          <li>Completed my Dual Degree Thesis, &apos;Robot Motion Planning using Derivatives of Rapidly Exploring Random Trees&apos;, at IIT Madras, earning both Bachelor&apos;s and Master&apos;s degrees in Mechanical Engineering.</li>
       </ul>
      </div>
    </article>
  );
}
