/* ─── Blog post data ─── */

import { GREEN, WHITE, MUTED, BORDER } from './tokens';

/* ── Shared inline styles for blog content ── */
const h2 = { fontSize: 22, fontWeight: 700, color: WHITE, marginTop: 36, marginBottom: 12 };
const h3 = { fontSize: 18, fontWeight: 700, color: WHITE, marginTop: 28, marginBottom: 8 };
const p = { color: MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 16 };
const ul = { margin: '4px 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, color: MUTED, fontSize: 15, lineHeight: 1.7 };
const ol = { ...ul };
const a = { color: GREEN, textDecoration: 'none' };
const strong = { color: WHITE };
const bq = { borderLeft: `3px solid ${GREEN}`, paddingLeft: 16, marginLeft: 0, marginBottom: 16, fontStyle: 'italic', color: MUTED, fontSize: 15, lineHeight: 1.7 };
const code = { background: '#1a2e1f', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: GREEN };
const hr = { border: 'none', borderTop: `1px solid ${BORDER}`, margin: '32px 0' };

/* ── Post 10 ── */
function MultisiteChurchAV() {
  return (
    <>
      <p style={p}>You built a solid production workflow at your main campus. The ATEM is dialed in, volunteers know the routine, and Sundays run smooth. Then leadership tells you to replicate it at a second location — with half the budget and zero additional staff. Sound familiar?</p>
      <p style={p}>Managing AV across multiple church campuses is one of the hardest scaling problems in church tech. This guide covers how to standardize your gear, train remote volunteers, and keep every campus running reliably — even when you can{"'"}t physically be there.</p>

      <h2 style={h2}>The Quick Win: Standardize Your Equipment</h2>
      <p style={p}>The single highest-leverage thing you can do for multisite AV is use <strong style={strong}>the same gear at every campus.</strong> Not similar gear. The same gear.</p>
      <p style={p}>When your main campus runs an ATEM Mini Pro and your second campus has a Roland V-1HD, every troubleshooting call becomes a translation exercise. Your volunteer at campus B says {"\""}the effects button isn{"'"}t working{"\""} and you{"'"}re Googling a switcher you{"'"}ve never touched while simultaneously running your own service.</p>
      <ul style={ul}>
        <li><strong style={strong}>Same video switcher</strong> — If ATEM Mini Pro works at your main campus, buy another one. Don{"'"}t {"\""}save money{"\""} with a different brand. The money you save on gear you{"'"}ll spend ten times over in training and troubleshooting.</li>
        <li><strong style={strong}>Same streaming software</strong> — If main campus uses OBS, every campus uses OBS. Same scenes, same profiles. Export your OBS profile and import it at the new site.</li>
        <li><strong style={strong}>Same network layout</strong> — Use the same IP scheme at every campus. ATEM is always <code style={code}>192.168.1.10</code>. Encoder is always <code style={code}>192.168.1.30</code>. A volunteer who knows campus A{"'"}s network already knows campus B{"'"}s.</li>
        <li><strong style={strong}>Same cable labels</strong> — Use the same naming convention. {"\""}CAM1-HDMI{"\""} is {"\""}CAM1-HDMI{"\""} everywhere. When a volunteer texts you {"\""}CAM1 is down,{"\""} you know exactly which cable to check regardless of location.</li>
      </ul>

      <blockquote style={bq}>The goal isn{"'"}t identical rooms — it{"'"}s interchangeable knowledge. A volunteer trained at one campus should be able to walk into any other campus and operate without retraining.</blockquote>

      <h2 style={h2}>Build a Gear Standard Document</h2>
      <p style={p}>Before you buy a single piece of equipment for a new campus, write down your standard. This document becomes the blueprint for every future expansion:</p>
      <ol style={ol}>
        <li><strong style={strong}>Video switcher</strong> — Model, firmware version, saved settings</li>
        <li><strong style={strong}>Camera(s)</strong> — Model, mount type, preset positions</li>
        <li><strong style={strong}>Streaming software</strong> — Application, version, exportable profile</li>
        <li><strong style={strong}>Audio interface</strong> — Model, routing from soundboard</li>
        <li><strong style={strong}>Network switch</strong> — Model, port assignments, IP plan</li>
        <li><strong style={strong}>Computer specs</strong> — Minimum CPU, RAM, GPU for your streaming workload</li>
        <li><strong style={strong}>Cable inventory</strong> — Types, lengths, labeling convention</li>
      </ol>
      <p style={p}>Keep this in a shared Google Doc or Notion page. When you open a third campus, you hand this document to whoever is setting up the room and they order the exact same list. No guessing, no {"\""}creative substitutions.{"\""}</p>

      <h2 style={h2}>Training Volunteers You Can{"'"}t Stand Next To</h2>
      <p style={p}>At your main campus, you trained volunteers by standing behind them during service. At a second campus 20 minutes away, that{"'"}s not an option. You need a training system that works without you in the room.</p>

      <h3 style={h3}>Create a Runbook, Not a Manual</h3>
      <p style={p}>A manual explains how things work. A runbook tells someone exactly what to do, step by step, in order. Write your runbook as a checklist:</p>
      <ul style={ul}>
        <li><strong style={strong}>30 minutes before service</strong> — Power on switcher, boot streaming computer, open OBS, verify stream key, test audio input</li>
        <li><strong style={strong}>15 minutes before</strong> — Frame cameras on presets, check audio levels, start a test stream for 30 seconds</li>
        <li><strong style={strong}>Service start</strong> — Go live, monitor audio levels, switch cameras per the shot list</li>
        <li><strong style={strong}>Service end</strong> — Stop stream, stop recording, save files, power down in order</li>
        <li><strong style={strong}>If something breaks</strong> — Decision tree: {"\""}Is it audio? Go to page 3. Is the stream down? Go to page 4.{"\""}</li>
      </ul>
      <p style={p}>Post the laminated runbook next to the console. Every campus gets the same runbook because every campus has the same gear.</p>

      <h3 style={h3}>Video Walkthroughs Over Written Docs</h3>
      <p style={p}>Record a 10-minute screen share of yourself running through the Sunday workflow. Volunteers will watch a video five times before they read a document once. Host it on a private YouTube playlist or Google Drive folder your team can access.</p>

      <h3 style={h3}>Shadow Shifts Still Work — Cross-Campus</h3>
      <p style={p}>Send new campus B volunteers to shadow at campus A for two Sundays before their campus goes live. They learn the workflow in person, then execute it on identical equipment at their own location. This builds confidence and creates a personal connection between the teams.</p>

      <h2 style={h2}>The Real Problem: You Can{"'"}t Be Everywhere on Sunday</h2>
      <p style={p}>This is the part nobody talks about in the multisite playbook. You{"'"}re one person. Service starts at the same time at both campuses. When something goes wrong at the campus you{"'"}re not at, your options are:</p>
      <ol style={ol}>
        <li>Hope the volunteer can figure it out from the runbook</li>
        <li>Take a panicked phone call while you{"'"}re running your own service</li>
        <li>Find out after service that the stream was down for 40 minutes</li>
      </ol>
      <p style={p}>None of these are acceptable — but they{"'"}re what most multisite churches live with until they solve the monitoring problem.</p>

      <h2 style={h2}>Remote Monitoring for Multisite Church AV</h2>
      <p style={p}><a href="/signup" style={a}>Tally</a> was built for exactly this scenario. Every campus runs the Tally app on its streaming computer. You see every campus on one dashboard — from your phone, from the booth, from wherever you are:</p>
      <ul style={ul}>
        <li><strong style={strong}>Per-campus status</strong> — See if each campus{"'"}s ATEM, encoder, audio, and stream are healthy. Green means good. Red means something needs attention right now.</li>
        <li><strong style={strong}>Instant alerts</strong> — If campus B{"'"}s stream drops, you get a Telegram notification within seconds — even while you{"'"}re running production at campus A.</li>
        <li><strong style={strong}>Auto-recovery</strong> — If the stream drops, Tally restarts it automatically. Most of the time the problem is resolved before the volunteer even realizes it happened.</li>
        <li><strong style={strong}>Pre-service checks</strong> — 30 minutes before every service, Tally verifies every device at every campus. You get one summary: {"\""}Campus A: all green. Campus B: ATEM offline.{"\""} Now you have time to call someone.</li>
        <li><strong style={strong}>Remote control</strong> — Switch cameras, start/stop streams, and trigger macros at any campus from Telegram. You don{"'"}t need to be physically present to fix things.</li>
      </ul>

      <p style={p}>Think about what this means for your Sunday: instead of hoping both campuses are fine, you <em>know</em> both campuses are fine. And when something goes wrong, you know about it in seconds — not after the service when a volunteer apologetically mentions the stream was down.</p>

      <h2 style={h2}>Campus Launch Checklist</h2>
      <p style={p}>When you{"'"}re ready to bring a new campus online, here{"'"}s the order of operations:</p>
      <ol style={ol}>
        <li><strong style={strong}>Order standard gear</strong> — Use your gear standard document. Identical equipment, no substitutions.</li>
        <li><strong style={strong}>Set up the network first</strong> — Install the AV switch, assign static IPs matching your standard scheme. See our <a href="/blog/church-av-network-setup-guide" style={a}>network setup guide</a> for details.</li>
        <li><strong style={strong}>Clone your streaming config</strong> — Export OBS profiles, ATEM macros, and camera presets from your main campus. Import at the new site.</li>
        <li><strong style={strong}>Install Tally</strong> — Connect the new campus to <a href="/signup" style={a}>Tally</a> so it shows up on your dashboard alongside your other locations.</li>
        <li><strong style={strong}>Send volunteers to shadow</strong> — Two Sundays at the main campus before the new campus goes live.</li>
        <li><strong style={strong}>Soft launch</strong> — Run one or two services as a test. Stream to an unlisted YouTube link. Fix issues before you{"'"}re live to the congregation.</li>
        <li><strong style={strong}>Go live with monitoring</strong> — First real Sunday. You watch both campuses from one dashboard. Breathe.</li>
      </ol>

      <hr style={hr} />

      <h2 style={h2}>FAQ</h2>

      <h3 style={h3}>Do I need a tech director at every campus?</h3>
      <p style={p}>Not necessarily. What you need is at least one trained volunteer per campus who can follow the runbook and escalate problems. With remote monitoring and auto-recovery handling the most common failures, a well-trained volunteer can run production without a dedicated TD on-site. The TD{"'"}s role shifts from hands-on operator to remote overseer across all locations.</p>

      <h3 style={h3}>Should each campus stream independently or simulcast?</h3>
      <p style={p}>It depends on your model. If each campus has its own worship and preaching, they stream independently. If you simulcast the sermon from your main campus, the satellite campuses receive the feed and may only need a simpler production setup (one camera, simpler switching). Either way, standardize the gear that each campus operates.</p>

      <h3 style={h3}>How much does it cost to set up a second campus for streaming?</h3>
      <p style={p}>A solid multisite streaming kit — ATEM Mini Pro, one PTZ camera, a streaming computer, audio interface, network switch, and cabling — runs roughly $2,000–$3,500 depending on camera choice. Add <a href="/#pricing" style={a}>Tally monitoring</a> for visibility across all your campuses. The biggest hidden cost isn{"'"}t gear — it{"'"}s the time you{"'"}ll spend troubleshooting remote problems without proper monitoring.</p>

      <h2 style={h2}>Start Building Your Multisite Playbook</h2>
      <p style={p}>Multisite AV doesn{"'"}t have to be chaos. Standardize the gear, document the workflow, train volunteers with repeatable systems, and monitor everything from one place. The churches that do this well aren{"'"}t the ones with the biggest budgets — they{"'"}re the ones with the best systems.</p>
      <p style={p}><a href="/signup" style={a}>Start a free trial of Tally</a> and see every campus on one dashboard. Setup takes about 10 minutes per location.</p>
    </>
  );
}

/* ── Post 1 ── */
function ChurchLiveStreamGuide() {
  return (
    <>
      <p style={p}>If your church is thinking about live streaming — or already streams but wants more reliable results — this guide walks you through every piece of the puzzle. No jargon, no assumptions. Just practical steps.</p>

      <h2 style={h2}>Why Live Streaming Matters for Churches</h2>
      <p style={p}>Live streaming isn't just a pandemic holdover. It's how you reach homebound members, traveling families, and people who aren't ready to walk through the door yet. A reliable stream says "we care about the people who can't be here."</p>

      <h2 style={h2}>The Equipment You Actually Need</h2>
      <p style={p}>You don't need a Hollywood budget. Here's what a solid church streaming setup looks like:</p>
      <ul style={ul}>
        <li><strong style={strong}>Camera(s)</strong> — Start with one good PTZ camera. A PTZ (pan-tilt-zoom) camera lets you control movement remotely, so one volunteer can frame multiple shots. Budget: $500–$2,000.</li>
        <li><strong style={strong}>Video switcher</strong> — The Blackmagic ATEM Mini or ATEM Mini Pro is the standard for churches. It takes multiple camera feeds and lets you cut between them. Budget: $300–$600.</li>
        <li><strong style={strong}>Encoder or streaming software</strong> — OBS Studio (free) or vMix runs on a computer and sends your video to YouTube/Facebook. Some churches use hardware encoders like a Teradek or YoloBox for simplicity.</li>
        <li><strong style={strong}>Audio</strong> — Your stream is only as good as your audio. Take a direct feed from your soundboard — never rely on a camera mic. A simple USB audio interface ($50–$150) bridges your mixer to the streaming computer.</li>
        <li><strong style={strong}>Internet</strong> — You need at least 10 Mbps upload speed, dedicated. A wired ethernet connection is non-negotiable. Wi-Fi will fail during Sunday service.</li>
      </ul>

      <h2 style={h2}>Step-by-Step: Getting Your First Stream Live</h2>
      <ol style={ol}>
        <li><strong style={strong}>Set up your camera(s)</strong> — Mount your PTZ camera at the back of the room or on a balcony rail. Run an HDMI or SDI cable to your tech booth.</li>
        <li><strong style={strong}>Connect your switcher</strong> — Plug camera feeds into the ATEM Mini inputs. Connect the ATEM's USB output to your streaming computer, or use the ATEM Mini Pro's built-in ethernet streaming.</li>
        <li><strong style={strong}>Route your audio</strong> — Take an aux send or direct out from your soundboard. Feed it into the ATEM or directly into OBS via a USB audio interface.</li>
        <li><strong style={strong}>Configure OBS or your encoder</strong> — Set your stream key from YouTube or Facebook. Start with 1080p at 4,500 kbps. Test on a weeknight before going live on Sunday.</li>
        <li><strong style={strong}>Do a full test run</strong> — Run through an entire mock service. Check audio levels, camera angles, and stream stability. Watch the stream on a phone from the parking lot.</li>
      </ol>

      <h2 style={h2}>Common Mistakes to Avoid</h2>
      <ul style={ul}>
        <li><strong style={strong}>Relying on Wi-Fi</strong> — Always use wired ethernet. Wi-Fi drops are the #1 cause of stream failures.</li>
        <li><strong style={strong}>Ignoring audio</strong> — Viewers will tolerate mediocre video but will leave immediately if audio is bad. Test your audio feed first.</li>
        <li><strong style={strong}>No monitoring</strong> — If your stream drops and nobody notices for 20 minutes, that's 20 minutes of lost viewers. You need a way to know instantly when something breaks.</li>
        <li><strong style={strong}>One volunteer, no backup plan</strong> — What happens when your one tech person is sick? Document your setup and cross-train at least two people.</li>
      </ul>

      <h2 style={h2}>Monitoring: The Missing Piece</h2>
      <p style={p}>Most churches set up streaming and hope for the best. But streams drop, encoders crash, and ATEM connections hiccup — especially on Sunday morning when everything needs to work.</p>
      <p style={p}><a href="/signup" style={a}>Tally</a> monitors your ATEM, OBS, vMix, and stream health in real time. If your stream drops, Tally auto-restarts it before anyone in the congregation notices. Your tech team gets instant alerts on Slack or Telegram with exactly what went wrong and how it was fixed.</p>
      <blockquote style={bq}>Think of it like a smoke detector for your stream — you hope it never goes off, but when it does, you're glad it's there.</blockquote>

      <h2 style={h2}>Next Steps</h2>
      <p style={p}>Once your stream is running reliably, consider adding:</p>
      <ul style={ul}>
        <li>A second camera for variety (wide shot + close-up)</li>
        <li>ProPresenter or EasyWorship for lower thirds and lyrics</li>
        <li>A recording setup for on-demand replay</li>
        <li><a href="/signup" style={a}>Production monitoring</a> so your team can relax on Sunday</li>
      </ul>
    </>
  );
}

/* ── Post 2 ── */
function AtemMiniSetup() {
  return (
    <>
      <p style={p}>The Blackmagic ATEM Mini is the most popular video switcher in church production — and for good reason. It's affordable, reliable, and packed with features. This guide walks you through setting it up specifically for church use.</p>

      <h2 style={h2}>Which ATEM Mini Should You Buy?</h2>
      <ul style={ul}>
        <li><strong style={strong}>ATEM Mini</strong> ($295) — 4 HDMI inputs, USB output only. Great for a single-camera-to-OBS workflow. No built-in streaming.</li>
        <li><strong style={strong}>ATEM Mini Pro</strong> ($495) — Adds built-in ethernet streaming (no computer needed) and recording to USB drive. The sweet spot for most churches.</li>
        <li><strong style={strong}>ATEM Mini Extreme</strong> ($995) — 8 HDMI inputs, 2 USB outputs, SuperSource for picture-in-picture. For larger productions with multiple cameras and graphics sources.</li>
      </ul>
      <p style={p}>For most churches starting out, the <strong style={strong}>ATEM Mini Pro</strong> is the best choice. You can stream directly from the switcher without a dedicated streaming computer.</p>

      <h2 style={h2}>Physical Setup</h2>
      <ol style={ol}>
        <li><strong style={strong}>Place the ATEM in your tech booth</strong> — Keep it accessible. You'll need to reach the buttons during service for manual cuts if needed.</li>
        <li><strong style={strong}>Connect cameras</strong> — Run HDMI cables from each camera to the ATEM inputs. Input 1 is typically your wide shot, Input 2 your close-up. Label your cables.</li>
        <li><strong style={strong}>Connect audio</strong> — Use the ATEM's 3.5mm mic inputs or embed audio through HDMI from your soundboard. For best results, use an HDMI audio embedder connected to your mixer's aux send.</li>
        <li><strong style={strong}>Connect to your network</strong> — Plug an ethernet cable into the ATEM (Mini Pro/Extreme). This enables streaming and remote management.</li>
        <li><strong style={strong}>Connect a monitor</strong> — Plug the HDMI output into a TV or monitor for multiview. This shows all inputs, program, and preview in one view.</li>
      </ol>

      <h2 style={h2}>Software Configuration</h2>
      <p style={p}>Download <strong style={strong}>ATEM Software Control</strong> from the Blackmagic Design website. Connect your computer to the same network as the ATEM.</p>
      <ol style={ol}>
        <li>Open ATEM Software Control — it should auto-discover your switcher</li>
        <li>Go to the <strong style={strong}>Streaming</strong> tab and enter your platform (YouTube, Facebook) and stream key</li>
        <li>Set your streaming quality — 1080p at 4,500–6,000 kbps for most church internet connections</li>
        <li>Set up your <strong style={strong}>audio mixer</strong> — adjust levels for each input so your soundboard feed is balanced</li>
        <li>Configure <strong style={strong}>macros</strong> — record common sequences like "switch to camera 1 + enable lower third" for one-button operation during service</li>
      </ol>

      <h2 style={h2}>Church-Specific Tips</h2>
      <ul style={ul}>
        <li><strong style={strong}>Use macros for service flow</strong> — Set up macros for common moments: worship wide shot, sermon close-up, announcement graphic. Train volunteers to press one button instead of multiple.</li>
        <li><strong style={strong}>Set up a multiview monitor</strong> — Place it where your camera operator can see all inputs at once. This is essential for smooth camera cuts.</li>
        <li><strong style={strong}>Label everything</strong> — In ATEM Software Control, rename inputs from "Camera 1" to "Wide Shot," "Pastor Cam," etc. This makes the multiview immediately readable for any volunteer.</li>
        <li><strong style={strong}>Test recording</strong> — The ATEM Mini Pro can record to a USB drive simultaneously while streaming. Use this as a backup and for uploading an on-demand version later.</li>
      </ul>

      <h2 style={h2}>Remote Monitoring with Tally</h2>
      <p style={p}>Once your ATEM is on the network, <a href="/signup" style={a}>Tally connects to it</a> and gives your team remote access to:</p>
      <ul style={ul}>
        <li>See which camera is live (program) and which is next (preview) — from your phone</li>
        <li>Switch cameras remotely via Telegram commands</li>
        <li>Get instant alerts if an ATEM input goes black or disconnects</li>
        <li>Run pre-service equipment checks automatically 30 minutes before service</li>
      </ul>
      <p style={p}>No more walking to the booth to check if everything is running. <a href="/signup" style={a}>Start a free trial</a> and connect your ATEM in under 10 minutes.</p>
    </>
  );
}

/* ── Post 3 ── */
function VolunteerTraining() {
  return (
    <>
      <p style={p}>Your tech team is probably volunteers — parents, students, and professionals who give their Sunday mornings to make production happen. Training them well is the difference between a smooth service and a stressful one. Here's a practical playbook.</p>

      <h2 style={h2}>Start with the "Why," Not the "How"</h2>
      <p style={p}>Before you teach anyone to press buttons, explain why production matters. Volunteers stay longer and try harder when they understand the mission:</p>
      <ul style={ul}>
        <li>The live stream reaches people who can't attend in person</li>
        <li>Good audio and video removes distractions from worship</li>
        <li>Reliable production lets the pastoral team focus on ministry, not technology</li>
      </ul>
      <p style={p}>When volunteers understand they're serving people — not just operating machines — their attention to detail goes up dramatically.</p>

      <h2 style={h2}>The Onboarding Checklist</h2>
      <p style={p}>Give every new volunteer a simple checklist for their first four weeks:</p>
      <ol style={ol}>
        <li><strong style={strong}>Week 1: Shadow</strong> — Sit next to an experienced operator. Watch. Ask questions. Don't touch anything yet.</li>
        <li><strong style={strong}>Week 2: Guided practice</strong> — Operate the equipment with an experienced person right next to them. They do the work; the mentor watches.</li>
        <li><strong style={strong}>Week 3: Solo with backup</strong> — They run production alone, but a mentor is in the building and reachable by text.</li>
        <li><strong style={strong}>Week 4: Independent</strong> — They're on their own. Check in after service to debrief.</li>
      </ol>

      <h2 style={h2}>Document Everything (Simply)</h2>
      <p style={p}>Create a one-page "Run of Show" document that lives in the booth. Include:</p>
      <ul style={ul}>
        <li>Step-by-step power-on sequence (which devices to turn on, in what order)</li>
        <li>Which buttons to press for common camera shots</li>
        <li>How to start and stop the stream</li>
        <li>Who to text if something breaks</li>
        <li>Step-by-step power-down sequence</li>
      </ul>
      <p style={p}>Keep it to one page. If it's longer, volunteers won't read it. Use screenshots from your actual setup, not generic diagrams. The <a href="/blog/church-service-rundown-booth" style={a}>booth run-of-show guide</a> is a fuller template if you need clock times and stream-state rows.</p>

      <h2 style={h2}>Build a Troubleshooting Triage</h2>
      <p style={p}>When something goes wrong during service, volunteers panic. Give them a simple decision tree:</p>
      <ol style={ol}>
        <li><strong style={strong}>Is the stream live?</strong> — Check the streaming platform on a phone. If yes, keep going. If no, restart OBS/the encoder.</li>
        <li><strong style={strong}>Is the audio working?</strong> — Check the stream audio on headphones. If silent, check the mixer aux send and the audio cable to the ATEM.</li>
        <li><strong style={strong}>Is a camera black?</strong> — Check the physical HDMI cable first. Unplug and replug. If still black, switch to a working camera and troubleshoot after service.</li>
        <li><strong style={strong}>Something else?</strong> — Text the TD (technical director). Don't try to fix something you don't understand during a live service.</li>
      </ol>

      <h2 style={h2}>Reduce the Panic with Automation</h2>
      <p style={p}>The best way to train volunteers isn't more documentation — it's fewer things that can go wrong. <a href="/signup" style={a}>Tally</a> handles the monitoring and recovery automatically:</p>
      <ul style={ul}>
        <li><strong style={strong}>Pre-service checks</strong> — 30 minutes before service, Tally verifies every device is online and connected. If something's wrong, your TD gets a Telegram alert before the volunteer even arrives.</li>
        <li><strong style={strong}>Auto-recovery</strong> — If the stream drops, Tally restarts it automatically. The volunteer doesn't need to know it happened.</li>
        <li><strong style={strong}>Guest access tokens</strong> — Give each volunteer a temporary access token that expires after their rotation. They can check system status from their phone without having admin access.</li>
      </ul>
      <p style={p}>When volunteers know there's a safety net, they're more confident. And confident volunteers stick around longer. <a href="/signup" style={a}>Start a free trial</a> to see how Tally simplifies your team's Sunday.</p>

      <h2 style={h2}>Keep Improving</h2>
      <ul style={ul}>
        <li><strong style={strong}>Debrief after every service</strong> — 5 minutes. What went well? What broke? Write it down.</li>
        <li><strong style={strong}>Rotate roles</strong> — Don't let one person be the only one who knows cameras. Cross-train everyone on every position.</li>
        <li><strong style={strong}>Celebrate wins</strong> — When a volunteer handles a problem gracefully, tell the team. Recognition is the best retention tool.</li>
      </ul>
    </>
  );
}

/* ── Post 4 ── */
function StreamingTroubleshooting() {
  return (
    <>
      <p style={p}>Something broke. The stream is down, the audio is gone, or the video looks terrible. Don't panic — most church streaming problems have simple fixes. Here are the 10 most common issues and exactly how to solve them.</p>

      <h2 style={h2}>1. Stream Dropped Mid-Service</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> Viewers see a frozen frame or "stream offline" message. Your encoder (OBS/vMix/hardware) may still show it's "live."</p>
      <p style={p}><strong style={strong}>Fix:</strong> Restart the stream in OBS (Stop Streaming → Start Streaming). If using an ATEM Mini Pro, press the ON AIR button off and back on. Check your internet connection — plug directly into the router if you're on a switch that might have lost link.</p>
      <p style={p}><strong style={strong}>Prevention:</strong> <a href="/signup" style={a}>Tally detects stream drops within seconds</a> and can auto-restart your encoder before viewers notice. For the in-service order of operations, use the <a href="/blog/church-stream-dropped-mid-sermon" style={a}>mid-sermon playbook</a>.</p>

      <h2 style={h2}>2. No Audio on the Stream</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> Video looks fine, but viewers hear nothing (or only hear room noise from a camera mic).</p>
      <p style={p}><strong style={strong}>Fix:</strong> Check the audio routing chain: soundboard aux send → audio cable → ATEM/audio interface → OBS audio input. Open OBS's Audio Mixer — if the meters aren't moving, the problem is upstream of OBS. Check the aux send level on your soundboard and make sure the cable is seated.</p>
      <p style={p}><strong style={strong}>Prevention:</strong> Always test audio before going live. Have a volunteer listen to the stream on headphones from a phone in the lobby for the first 2 minutes.</p>

      <h2 style={h2}>3. Camera Feed Goes Black</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> One or more ATEM inputs show a black screen. The camera itself may still be working.</p>
      <p style={p}><strong style={strong}>Fix:</strong> Check the HDMI/SDI cable at both ends. Unplug and replug. If the cable is long (&gt;25 feet for HDMI), it may need a signal booster or replacement. Check that the camera hasn't gone to sleep mode. Immediately switch to a working camera for the stream while you troubleshoot.</p>

      <h2 style={h2}>4. Laggy or Choppy Video</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> The stream looks like a slideshow — frames dropping, stuttering, pixelation.</p>
      <p style={p}><strong style={strong}>Fix:</strong> Your upload bandwidth is probably saturated. Lower your bitrate in OBS (try 3,000 kbps instead of 6,000). Close other applications using the internet on the streaming computer. If using Wi-Fi — stop. Run an ethernet cable.</p>
      <p style={p}><strong style={strong}>Prevention:</strong> Run a speed test before every service. You need at least 1.5x your streaming bitrate as available upload speed.</p>

      <h2 style={h2}>5. OBS Crashes or Freezes</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> OBS window goes unresponsive, or the application closes entirely. Stream goes offline.</p>
      <p style={p}><strong style={strong}>Fix:</strong> Restart OBS and click "Start Streaming" again. If it happens repeatedly, check your computer's CPU and RAM usage — OBS may be running out of resources. Disable any browser sources you don't need. Lower your output resolution from 1080p to 720p.</p>
      <p style={p}><strong style={strong}>Prevention:</strong> Keep the streaming computer dedicated to streaming. Don't run presentation software, email, or web browsers on the same machine. See <a href="/blog/obs-church-streaming-crash-recovery" style={a}>OBS crash recovery for church</a> for settings and a restart order.</p>

      <h2 style={h2}>6. ATEM Disconnects from Network</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> ATEM Software Control says "searching for switcher." Remote control stops working. The ATEM itself still works locally.</p>
      <p style={p}><strong style={strong}>Fix:</strong> Check the ethernet cable to the ATEM. Restart the ATEM by power-cycling it (unplug power, wait 10 seconds, plug back in). Check that your network switch hasn't lost power. Verify the ATEM's IP address hasn't changed (check in the ATEM's network settings via the physical buttons on the unit).</p>
      <p style={p}><strong style={strong}>Prevention:</strong> Set a static IP address on your ATEM so it doesn't change. <a href="/signup" style={a}>Tally monitors your ATEM connection</a> and alerts you the moment it drops off the network.</p>

      <h2 style={h2}>7. Recording Failed</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> You thought you were recording, but the file is missing, corrupted, or only contains part of the service.</p>
      <p style={p}><strong style={strong}>Fix:</strong> Check that the USB drive (ATEM) or hard drive (OBS) has enough free space. Format the USB drive as exFAT for ATEM recording. In OBS, check Settings → Output → Recording Path and make sure it points to a drive with space.</p>

      <h2 style={h2}>8. YouTube/Facebook Says "Stream Key Invalid"</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> OBS or ATEM says it can't connect to the streaming service. Error messages about authentication or invalid key.</p>
      <p style={p}><strong style={strong}>Fix:</strong> Stream keys can expire or be reset. Go to YouTube Studio (or Facebook Live Producer) and copy a fresh stream key. Paste it into OBS or ATEM Software Control. Make sure there are no extra spaces before or after the key.</p>

      <h2 style={h2}>9. Echo or Feedback on Stream</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> Viewers hear a double or echo effect. The audio sounds hollow or reverberant.</p>
      <p style={p}><strong style={strong}>Fix:</strong> You probably have two audio sources active — the soundboard feed AND a camera mic. In OBS, mute the camera's built-in mic (right-click the audio source → Properties → disable). In the ATEM audio mixer, mute the mic inputs on camera channels — only enable your external audio source.</p>

      <h2 style={h2}>10. "It Worked Last Week, Now Nothing Works"</h2>
      <p style={p}><strong style={strong}>Symptoms:</strong> Everything was fine last Sunday. Now multiple things are broken. Nothing changed (you think).</p>
      <p style={p}><strong style={strong}>Fix:</strong> Something changed — you just don't know what yet. Common culprits: a software update ran overnight (OBS, Windows, macOS), someone moved a cable, the network switch lost power and devices got new IP addresses, or the streaming platform changed something on their end.</p>
      <p style={p}>Start from the bottom: power, cables, network, software, platform. Check each layer systematically.</p>
      <p style={p}><strong style={strong}>Prevention:</strong> <a href="/signup" style={a}>Tally runs a full system check 30 minutes before every service</a>. If anything changed since last week — a device offline, a connection dropped, a software version updated — you'll know before the service starts, not during it.</p>

      <hr style={hr} />
      <p style={p}>Most streaming problems come down to three things: cables, internet, and software that needs restarting. Fix those, and you'll solve 90% of Sunday morning issues. For the other 10%, having <a href="/signup" style={a}>automated monitoring and recovery</a> means your team can focus on the service instead of firefighting.</p>
    </>
  );
}

/* ── Post 5 ── */
function RemoteMonitoring() {
  return (
    <>
      <p style={p}>You shouldn't have to be in the building to know if your church production is working. Whether you're the technical director sitting in the congregation, a pastor checking from home, or a volunteer on the way to church — remote monitoring gives you peace of mind.</p>

      <h2 style={h2}>What Should You Monitor?</h2>
      <p style={p}>A church production system has multiple failure points. Here's what matters most:</p>
      <ul style={ul}>
        <li><strong style={strong}>Stream health</strong> — Is the live stream actually reaching viewers? What's the bitrate, frame rate, and connection stability?</li>
        <li><strong style={strong}>Equipment status</strong> — Is the ATEM online? Is OBS running? Are all cameras connected? Is the audio console responding?</li>
        <li><strong style={strong}>Audio levels</strong> — Is audio actually present in the stream, or is it silent? Are levels clipping?</li>
        <li><strong style={strong}>Recording status</strong> — Is the recording running? Is there enough disk space?</li>
        <li><strong style={strong}>Network connectivity</strong> — Are all devices reachable on the network?</li>
      </ul>

      <h2 style={h2}>The DIY Approach (and Its Limits)</h2>
      <p style={p}>Some churches try to build their own monitoring with free tools:</p>
      <ul style={ul}>
        <li><strong style={strong}>Watch the stream on your phone</strong> — This tells you if the stream is live, but there's a 15-30 second delay. By the time you see a problem, your viewers have been staring at a frozen screen for half a minute.</li>
        <li><strong style={strong}>TeamViewer or remote desktop</strong> — You can see the streaming computer's screen, but it's slow, uses bandwidth, and doesn't give you structured alerts.</li>
        <li><strong style={strong}>Slack channel for manual check-ins</strong> — "Is everything working?" messages before service. Relies on someone remembering to check and respond.</li>
      </ul>
      <p style={p}>These approaches are better than nothing, but they're reactive — you find out about problems after they've already affected viewers.</p>

      <h2 style={h2}>What Purpose-Built Monitoring Looks Like</h2>
      <p style={p}><a href="/signup" style={a}>Tally</a> was built specifically for church production monitoring. Here's what changes when you have a dedicated system:</p>

      <h3 style={h3}>Instant Alerts</h3>
      <p style={p}>When your stream drops, your ATEM disconnects, or an OBS source goes offline — you get a Slack or Telegram notification within seconds. Not minutes. The alert includes what went wrong, which device is affected, and what's being done about it.</p>

      <h3 style={h3}>Automatic Recovery</h3>
      <p style={p}>Most stream failures can be fixed by restarting the encoder. Tally does this automatically. Your stream comes back before most viewers even notice it went down. After service, you see exactly what happened and when in the incident timeline.</p>

      <h3 style={h3}>Pre-Service Equipment Check</h3>
      <p style={p}>30 minutes before every scheduled service, Tally checks every connected device: ATEM, OBS, audio consoles, cameras, recording drives. If anything isn't ready, your TD gets a checklist of what needs attention — while there's still time to fix it.</p>

      <h3 style={h3}>Remote Control</h3>
      <p style={p}>Beyond monitoring, you can actually control your production remotely. Switch cameras, advance ProPresenter slides, trigger macros, start/stop recording — all from Telegram on your phone. No need to walk to the booth.</p>

      <h3 style={h3}>Team Visibility</h3>
      <p style={p}>Every church gets a portal where your team can see device status, service history, and incident logs. Guest TD tokens let volunteers check status without having full admin access. The on-call rotation ensures alerts go to the right person each week.</p>

      <h2 style={h2}>What It Costs (Less Than You Think)</h2>
      <p style={p}>Tally starts at <a href="/#pricing" style={a}>$49/month for one room</a> with a 30-day free trial. That's less than what most churches spend on a single cable. For that, you get monitoring, alerts, auto-recovery, remote control, and pre-service checks.</p>
      <p style={p}>Compare that to the cost of a dropped stream during Easter service, or the burnout of a volunteer who gets blamed every time something goes wrong.</p>

      <h2 style={h2}>Getting Started</h2>
      <ol style={ol}>
        <li><a href="/signup" style={a}>Sign up for a free trial</a></li>
        <li>Install the Tally desktop app on your booth computer (10 minutes)</li>
        <li>Enter the IP addresses for your ATEM, OBS, and other equipment</li>
        <li>Connect Slack or Telegram for alerts</li>
        <li>Set your service schedule so pre-checks run at the right time</li>
      </ol>
      <p style={p}>Your next Sunday, you'll have a full equipment check before service starts, instant alerts if anything goes wrong, and automatic recovery if the stream drops. No more hoping for the best.</p>
    </>
  );
}

/* ── Post 6 ── */
function NetworkSetupGuide() {
  return (
    <>
      <p style={p}>The #1 reason church production systems fail on Sunday morning isn't bad equipment — it's bad networking. A DHCP lease expires, an IP address changes, and suddenly your ATEM disappears. This guide walks you through setting up a reliable network for your church AV gear so connections stay solid week after week.</p>

      <h2 style={h2}>Why Your AV Gear Needs Its Own Network</h2>
      <p style={p}>Your church probably has one network for everything: staff laptops, guest Wi-Fi, the office printer, and all your production equipment. That works fine until Sunday morning, when 200 phones connect to Wi-Fi and your ATEM starts dropping packets.</p>
      <p style={p}>Production equipment needs predictable, low-latency connections. A dedicated AV network — even if it's just a separate switch — isolates your production traffic from everything else. No more competing with Instagram for bandwidth.</p>

      <h2 style={h2}>The Golden Rule: Static IPs Everywhere</h2>
      <p style={p}>If you take one thing from this article, let it be this: <strong style={strong}>assign a static IP to every piece of AV equipment.</strong> No exceptions.</p>
      <p style={p}>Here's what happens with DHCP: your ATEM gets assigned 192.168.1.47 on Tuesday. On Sunday, the DHCP lease expires, the router hands out 192.168.1.112 instead, and now your Tally app, ATEM Software Control, and everything else that talks to the ATEM can't find it. Mid-service. With 500 people watching online.</p>
      <p style={p}>A typical static IP plan looks like this:</p>
      <ul style={ul}>
        <li><strong style={strong}>ATEM Switcher</strong> — 192.168.1.10</li>
        <li><strong style={strong}>PTZ Camera 1</strong> — 192.168.1.21</li>
        <li><strong style={strong}>PTZ Camera 2</strong> — 192.168.1.22</li>
        <li><strong style={strong}>PTZ Camera 3</strong> — 192.168.1.23</li>
        <li><strong style={strong}>OBS / Encoder</strong> — 192.168.1.30</li>
        <li><strong style={strong}>Audio Console</strong> — 192.168.1.40</li>
        <li><strong style={strong}>Companion</strong> — 192.168.1.50</li>
        <li><strong style={strong}>Tally Computer</strong> — 192.168.1.100</li>
      </ul>
      <p style={p}>Write these down. Tape them inside your rack. Put them in a shared doc. You will need this list again — probably at the worst possible time.</p>

      <h2 style={h2}>Wiring: Keep It Simple, Keep It Wired</h2>
      <p style={p}>Plug every piece of AV gear into the same physical network switch. A basic 16-port gigabit switch costs under $50 and eliminates an entire category of problems.</p>
      <ul style={ul}>
        <li><strong style={strong}>Never use Wi-Fi for production gear.</strong> Wi-Fi is shared, half-duplex, and subject to interference from every microwave and Bluetooth device in the building. It will fail during service.</li>
        <li><strong style={strong}>Use Cat6 cable</strong> for any run longer than 10 feet. Cat5e is fine for short patch cables between nearby devices.</li>
        <li><strong style={strong}>Label every cable.</strong> Both ends. With a label maker, not masking tape. When something disconnects at 10:55am on Sunday, you don't want to play cable detective.</li>
        <li><strong style={strong}>Uplink the AV switch to your router</strong> so the Tally computer can reach the internet for relay connections. The relay uses standard HTTPS — no special firewall rules.</li>
      </ul>

      <h2 style={h2}>Setting Static IPs on Common Church Gear</h2>
      <p style={p}>Every device handles network settings differently. Here's where to find them:</p>

      <h3 style={h3}>ATEM Switcher</h3>
      <p style={p}>Open ATEM Software Control → Switcher Settings → Network. Set a static IP, subnet mask (255.255.255.0), and gateway (your router's IP). Click Apply. The ATEM will restart its network interface — wait about 10 seconds.</p>

      <h3 style={h3}>PTZ Cameras</h3>
      <p style={p}>Open the camera's web interface (browse to its current IP address). Navigate to Network settings and assign your planned static IP. Most PTZ cameras require a reboot after changing network settings.</p>

      <h3 style={h3}>Audio Console (X32, A&H, Yamaha)</h3>
      <p style={p}>On the console itself, go to Setup → Network (or Global → Network on some models). Assign the static IP directly. Some consoles require you to confirm and reboot.</p>

      <h3 style={h3}>The Tally Computer</h3>
      <p style={p}>On Mac: System Settings → Network → Ethernet → Details → TCP/IP → Configure IPv4: Manually. On Windows: Network and Internet → Ethernet → IP assignment → Edit.</p>

      <h2 style={h2}>Verifying Everything Works</h2>
      <p style={p}>After assigning static IPs and wiring everything to the switch, verify connectivity from the Tally computer:</p>
      <ol style={ol}>
        <li><strong style={strong}>Ping every device</strong> — Open a terminal and ping each IP. Every device should respond in under 5ms on a local switch. If a device doesn't respond, check the cable and confirm the IP was saved.</li>
        <li><strong style={strong}>Check Tally</strong> — Open the Tally app. Every connected device should show a green status dot. If something's red, the IP in Tally's config doesn't match the device, or the device isn't reachable.</li>
        <li><strong style={strong}>Test the relay</strong> — Confirm Tally shows "Connected" to the relay. If not, the AV network doesn't have a route to the internet — check the uplink from your AV switch to the router.</li>
      </ol>

      <h2 style={h2}>Advanced: VLANs and Managed Switches</h2>
      <p style={p}>If your church has a managed network (or an IT person who uses words like "VLAN"), you can go further:</p>
      <ul style={ul}>
        <li><strong style={strong}>VLAN 10 — AV Production</strong> — ATEM, cameras, Tally, encoders. Isolated from office and guest traffic.</li>
        <li><strong style={strong}>VLAN 20 — Church Office</strong> — Staff computers, printers.</li>
        <li><strong style={strong}>VLAN 30 — Guest Wi-Fi</strong> — Congregation devices. No access to production equipment.</li>
      </ul>
      <p style={p}>Enable <strong style={strong}>IGMP snooping</strong> on the switch if you use ATEM discovery or NDI — these protocols use multicast, and IGMP snooping prevents multicast traffic from flooding every port.</p>
      <p style={p}>If you're running NDI video streams (100–150 Mbps each), make sure your switch is gigabit and avoid daisy-chaining consumer switches. Everything else — ATEM control, PTZ commands, Tally status — uses less than 1 Mbps.</p>

      <h2 style={h2}>The Network Problems That Ruin Sundays</h2>
      <p style={p}>Here are the network issues we see most often at churches — and how to prevent them:</p>
      <ul style={ul}>
        <li><strong style={strong}>ATEM drops randomly</strong> — Almost always a DHCP issue. Assign a static IP and it stops.</li>
        <li><strong style={strong}>Camera unreachable after power cycle</strong> — The camera reverted to DHCP or a factory-default IP. Re-assign the static IP in the camera's web interface.</li>
        <li><strong style={strong}>Everything worked last week</strong> — Something changed and nobody noticed. A firmware update ran overnight, a cable got kicked, or the router rebooted and assigned new DHCP addresses to anything without a static IP.</li>
        <li><strong style={strong}>High latency on a local network</strong> — Usually a bad cable, a dying switch port, or a broadcast storm. Swap cables, try a different port, and check if any device is flooding the network.</li>
        <li><strong style={strong}>IP conflicts</strong> — Two devices sharing the same IP address. Both behave erratically. Audit your IP table and confirm no overlaps.</li>
      </ul>

      <h2 style={h2}>How Tally Helps You Catch Network Problems Early</h2>
      <p style={p}><a href="/signup" style={a}>Tally</a> monitors the network health of every connected device in real time:</p>
      <ul style={ul}>
        <li><strong style={strong}>Per-device latency tracking</strong> — See round-trip times for your ATEM, cameras, audio console, and relay connection. If latency spikes, you know before it affects production.</li>
        <li><strong style={strong}>Connection health scores</strong> — Each device gets a green/yellow/red health indicator based on latency, command success rate, and reconnection frequency. A device that keeps reconnecting is a device about to fail.</li>
        <li><strong style={strong}>Reconnection alerts</strong> — If a device drops and reconnects, Tally logs it. A device that reconnects 5 times in an hour is telling you something — probably a bad cable or a flaky switch port.</li>
        <li><strong style={strong}>Pre-service network check</strong> — 30 minutes before service, Tally verifies every device is reachable and responding normally. If your ATEM's IP changed overnight, you find out before service — not during.</li>
      </ul>
      <p style={p}><a href="/signup" style={a}>Start a free trial</a> and see your network health dashboard within 10 minutes of connecting your first device.</p>

      <h2 style={h2}>Checklist: Is Your Network Sunday-Ready?</h2>
      <ul style={ul}>
        <li>Every AV device has a static IP (not DHCP)</li>
        <li>All devices are wired to the same switch — no Wi-Fi</li>
        <li>Every device responds to ping in under 5ms</li>
        <li>IP assignments are documented and accessible</li>
        <li>Cables are labeled at both ends</li>
        <li>The AV switch has an uplink to the internet</li>
        <li>Tally shows green status dots for all equipment</li>
      </ul>
      <p style={p}>Get these right and you'll eliminate the most common category of Sunday morning failures. Your volunteers will thank you.</p>
    </>
  );
}

/* ── Post 7 ── */
function PTZCameraBuyingGuide() {
  return (
    <>
      <p style={p}>PTZ cameras are the workhorse of church production. One operator can control multiple angles, zoom into the pastor, and frame a wide worship shot — all without leaving the booth. But with dozens of models on the market, picking the right one matters. This guide breaks down what to look for, what to avoid, and which cameras actually hold up on Sunday morning.</p>

      <h2 style={h2}>Why PTZ Cameras Are Perfect for Churches</h2>
      <p style={p}>A traditional camcorder needs a dedicated operator behind it. A PTZ (pan-tilt-zoom) camera sits on a mount and moves remotely — via a joystick controller, software, or even your phone. That means:</p>
      <ul style={ul}>
        <li><strong style={strong}>Fewer volunteers needed</strong> — One person in the booth can operate 2-4 PTZ cameras using presets. No need to recruit a camera operator for each angle.</li>
        <li><strong style={strong}>Consistent framing</strong> — Save preset positions for your pastor close-up, wide shot, and baptistry angle. Hit a button and the camera snaps to that exact position every time.</li>
        <li><strong style={strong}>Clean install</strong> — Mount them on walls or ceilings. No tripods in the aisle. No cables running across walkways.</li>
        <li><strong style={strong}>Remote operation</strong> — Adjust framing from the booth, from the lobby, or from home if your production system supports remote control.</li>
      </ul>

      <h2 style={h2}>Key Specs That Actually Matter</h2>
      <p style={p}>Camera spec sheets are full of numbers. Here are the ones that make a real difference in a church environment:</p>

      <h3 style={h3}>Optical Zoom</h3>
      <p style={p}>This is how far the camera can zoom without losing quality. Digital zoom crops the image and looks terrible on stream. For most sanctuaries, <strong style={strong}>20x optical zoom</strong> is the sweet spot. If your camera is mounted at the back of a large auditorium (100+ feet from the stage), look for 30x.</p>

      <h3 style={h3}>Sensor Size</h3>
      <p style={p}>Bigger sensors capture more light, which means better image quality in dim worship environments. A <strong style={strong}>1/2.8" sensor</strong> is standard at the mid-range. Budget cameras with 1/4" sensors will look noisy (grainy) during dimly-lit worship sets.</p>

      <h3 style={h3}>Output Connections</h3>
      <ul style={ul}>
        <li><strong style={strong}>HDMI</strong> — Standard on every PTZ camera. Works with ATEM Mini and most switchers. Cable runs limited to about 25-50 feet without a signal booster.</li>
        <li><strong style={strong}>SDI</strong> — Professional standard. Supports cable runs up to 300 feet without signal loss. Required for larger sanctuaries. Look for 3G-SDI for 1080p.</li>
        <li><strong style={strong}>NDI</strong> — Sends video over ethernet. No HDMI/SDI cable needed — just a network drop. Great for flexible installations, but requires a solid gigabit network and NDI-compatible software.</li>
        <li><strong style={strong}>USB</strong> — Useful as a webcam fallback or for connecting directly to a laptop running Zoom. Not a primary production output.</li>
      </ul>

      <h3 style={h3}>Low-Light Performance</h3>
      <p style={p}>This is where church use gets tricky. Worship lighting is often dramatic — dark audience, bright stage, moving colors. Cheap cameras lose detail in shadows and blow out highlights. Look for cameras with at least <strong style={strong}>0.5 lux minimum illumination</strong> and manual exposure controls so you can lock settings during service.</p>

      <h2 style={h2}>Budget Tiers: What You Get at Each Price Point</h2>

      <h3 style={h3}>Under $500 — Entry Level</h3>
      <p style={p}>Cameras in this range (like budget offerings from Zowietek or generic Amazon PTZ units) get you started but come with trade-offs: noisy low-light performance, slower pan/tilt motors, and limited color accuracy. Fine for a single-camera setup streaming to YouTube at 720p. Not great for multi-camera switching.</p>

      <h3 style={h3}>$800–$1,500 — Mid-Range (Best Value for Most Churches)</h3>
      <p style={p}>This is where most churches should land. Cameras from <strong style={strong}>PTZOptics, BirdDog, and HuddleCamHD</strong> in this range offer 20-30x zoom, SDI + HDMI + NDI outputs, solid low-light performance, and reliable preset recall. The PTZOptics Move 4K and BirdDog P200 are popular choices in this tier.</p>

      <h3 style={h3}>$2,000+ — Broadcast Quality</h3>
      <p style={p}>Panasonic AW series, Sony SRG series, and BirdDog P400 live here. Larger sensors, better color science, true 4K output, and rock-solid reliability. Worth it for large churches with IMAG (image magnification) screens or broadcast-quality stream requirements.</p>

      <h2 style={h2}>How Many Cameras Do You Need?</h2>
      <ul style={ul}>
        <li><strong style={strong}>1 camera</strong> — Minimum viable production. A single PTZ at the back on a wide-to-medium shot. Works for streaming, but feels static to viewers.</li>
        <li><strong style={strong}>2 cameras</strong> — The sweet spot for most churches. Wide shot + close-up of the speaker. Cut between them for visual variety. Dramatic improvement over single-camera.</li>
        <li><strong style={strong}>3 cameras</strong> — Wide + pastor close-up + worship/stage angle. Covers 95% of service moments. This is what most mid-size churches run.</li>
        <li><strong style={strong}>4+ cameras</strong> — Multi-campus, IMAG, or broadcast-level production. You probably need a dedicated video director at this point.</li>
      </ul>

      <h2 style={h2}>Mounting and Placement Tips</h2>
      <ul style={ul}>
        <li><strong style={strong}>Mount high, aim down slightly</strong> — Ceiling or high wall mounts give the cleanest sight lines. Mounting at eye level means every person who walks in front of the camera blocks the shot.</li>
        <li><strong style={strong}>Avoid backlighting</strong> — Don't mount a camera facing a window or bright wall. The camera will expose for the bright background and your speaker will be a silhouette.</li>
        <li><strong style={strong}>Run cables before you mount</strong> — HDMI, SDI, ethernet, and power. Route them through conduit if possible. A cable that runs across a ceiling tile and disappears into a wall looks professional and avoids accidental disconnects.</li>
        <li><strong style={strong}>Label your presets</strong> — Most PTZ cameras support 8-255 preset positions. Name them something your volunteers understand: "Pastor Close," "Wide Worship," "Baptistry," "Offering." Not "Preset 1, 2, 3."</li>
      </ul>

      <h2 style={h2}>Controlling PTZ Cameras with Tally</h2>
      <p style={p}><a href="/signup" style={a}>Tally integrates with PTZ cameras</a> alongside your ATEM, OBS, and audio gear — giving your team a single control surface for the entire production:</p>
      <ul style={ul}>
        <li><strong style={strong}>Recall presets from Telegram</strong> — Type "camera 1 preset 3" and Tally moves the camera. No joystick controller needed.</li>
        <li><strong style={strong}>Camera status monitoring</strong> — See which cameras are online, which preset they're on, and whether any input has gone black — from your phone or the church portal.</li>
        <li><strong style={strong}>Autopilot rundowns</strong> — Create step-by-step production rundowns that auto-advance on a timer during service. Tally executes each step automatically.</li>
        <li><strong style={strong}>Pre-service camera check</strong> — 30 minutes before service, Tally verifies every camera is responding and connected. If a camera has lost power or network, your TD gets an alert before volunteers arrive.</li>
      </ul>
      <p style={p}><a href="/signup" style={a}>Start a free trial</a> and connect your PTZ cameras alongside your ATEM in under 10 minutes.</p>

      <h2 style={h2}>Quick Decision Guide</h2>
      <ul style={ul}>
        <li><strong style={strong}>Small church, tight budget</strong> — 1 PTZ camera (20x, HDMI) + ATEM Mini. Budget: $700–$1,000 total.</li>
        <li><strong style={strong}>Mid-size church, 2-3 cameras</strong> — PTZOptics or BirdDog (20-30x, SDI + NDI) + ATEM Mini Extreme. Budget: $3,000–$5,000 total.</li>
        <li><strong style={strong}>Large church, IMAG</strong> — Panasonic or Sony PTZ (30x, SDI) + Blackmagic ATEM Constellation. Budget: $10,000+ for cameras alone.</li>
      </ul>
      <p style={p}>Start with two cameras if you can afford it. The visual variety of cutting between a wide shot and a close-up is the single biggest upgrade most church streams can make.</p>
    </>
  );
}

/* ── Post 8 ── */
function ProPresenterATEMGuide() {
  return (
    <>
      <p style={p}>ProPresenter is the presentation software most churches rely on for lyrics, sermon slides, and announcements. The ATEM Mini is the most popular video switcher in church production. Connecting them properly transforms your production from "a volunteer clicking two things at once" to a seamless, automated workflow. Here's how to set it up.</p>

      <h2 style={h2}>How ProPresenter Connects to the ATEM</h2>
      <p style={p}>ProPresenter sends its output as a video signal — just like a camera. You connect the computer running ProPresenter to one of the ATEM's HDMI inputs. The ATEM treats it like any other video source. When you want to show lyrics or slides on stream, you cut to that input.</p>
      <p style={p}>The basic connection chain:</p>
      <ol style={ol}>
        <li><strong style={strong}>ProPresenter computer</strong> → HDMI cable → <strong style={strong}>ATEM HDMI input</strong> (usually Input 3 or 4)</li>
        <li>ProPresenter sends its "Output" screen to that HDMI — configure this in ProPresenter's Screens settings</li>
        <li>In the ATEM, label that input "ProPresenter" or "Lyrics" so your volunteers know what it is</li>
      </ol>

      <h2 style={h2}>ProPresenter Screen Configuration</h2>
      <p style={p}>ProPresenter supports multiple outputs. For church production, you typically use:</p>
      <ul style={ul}>
        <li><strong style={strong}>Audience screen</strong> — The main display facing the congregation (projector or TV). Shows lyrics, sermon slides, announcements.</li>
        <li><strong style={strong}>Stage display</strong> — A confidence monitor facing the worship leader or pastor. Shows current/next slides, notes, timers.</li>
        <li><strong style={strong}>Stream output</strong> — The HDMI feed going to your ATEM. This can be identical to the audience screen, or a separate "stream-friendly" layout with different formatting.</li>
      </ul>
      <p style={p}>Many churches send the same output to both the audience screen and the ATEM. This works, but you lose flexibility. A dedicated stream output lets you adjust text size, add lower thirds, or show different backgrounds optimized for the stream.</p>

      <h2 style={h2}>Resolution and Frame Rate — Get These Right</h2>
      <p style={p}>The ATEM Mini requires all inputs to be the same resolution and frame rate. If your cameras are sending 1080p at 59.94fps, ProPresenter must output the same. A mismatch causes the ATEM to show a black screen on that input.</p>
      <ul style={ul}>
        <li>Set ProPresenter's output resolution to <strong style={strong}>1920x1080</strong></li>
        <li>Set the refresh rate to match your cameras — usually <strong style={strong}>59.94 Hz</strong> (NTSC) or <strong style={strong}>50 Hz</strong> (PAL)</li>
        <li>On Mac, check System Settings → Displays for the HDMI output going to the ATEM</li>
        <li>On Windows, right-click the desktop → Display Settings → Advanced Display Settings for the output going to the ATEM</li>
      </ul>
      <blockquote style={bq}>If the ATEM shows a black screen on your ProPresenter input but other inputs work fine, the resolution or frame rate is almost certainly wrong. This is the #1 troubleshooting issue with ATEM + ProPresenter.</blockquote>

      <h2 style={h2}>Using the ATEM's Upstream Keyer for Overlays</h2>
      <p style={p}>Instead of cutting fully to ProPresenter, you can <strong style={strong}>overlay</strong> lyrics on top of a camera feed using the ATEM's upstream keyer. This gives you a professional look — camera footage of worship with lyrics floating at the bottom.</p>
      <ol style={ol}>
        <li>In ProPresenter, use a <strong style={strong}>black background</strong> for your lyrics slides</li>
        <li>In ATEM Software Control, go to the <strong style={strong}>Upstream Key</strong> section</li>
        <li>Set the key type to <strong style={strong}>Luma Key</strong></li>
        <li>Set the fill source to your ProPresenter HDMI input</li>
        <li>Adjust the clip and gain until the black background disappears and only the white text remains</li>
        <li>Toggle the key ON during worship — lyrics appear over your camera feed</li>
      </ol>
      <p style={p}>This is a huge visual upgrade over cutting back and forth between cameras and a full-screen lyrics slide. Most viewers won't even notice you're using a keyer — it just looks like a professional broadcast.</p>

      <h2 style={h2}>ATEM Macros for ProPresenter Workflows</h2>
      <p style={p}>ATEM macros let you record sequences of actions and replay them with one button press. Combined with ProPresenter, this eliminates multi-step operations during service:</p>
      <ul style={ul}>
        <li><strong style={strong}>"Worship" macro</strong> — Switch to Camera 1 wide + enable luma key overlay from ProPresenter. One button for the entire worship look.</li>
        <li><strong style={strong}>"Sermon" macro</strong> — Switch to Camera 2 close-up + disable keyer + set a transition to a 1-second mix. Clean transition into sermon.</li>
        <li><strong style={strong}>"Announcements" macro</strong> — Cut to ProPresenter full screen + disable keyer. ProPresenter fills the stream with announcement slides.</li>
        <li><strong style={strong}>"Offering" macro</strong> — Switch to Camera 1 + enable downstream keyer with a giving URL lower third.</li>
      </ul>
      <p style={p}>Train volunteers to press macro buttons instead of making multiple switcher changes. Fewer steps means fewer mistakes during a live service.</p>

      <h2 style={h2}>Common Integration Problems</h2>
      <ul style={ul}>
        <li><strong style={strong}>Black screen on ATEM input</strong> — Resolution/frame rate mismatch. Check ProPresenter output settings match the ATEM's video standard.</li>
        <li><strong style={strong}>Lyrics look blurry on stream</strong> — ProPresenter is outputting at a lower resolution than 1080p, or the ATEM is scaling it. Match resolutions exactly.</li>
        <li><strong style={strong}>Keyer shows a green/gray border around text</strong> — The clip/gain settings on the luma key need adjustment. Increase the clip value until the background is completely clean.</li>
        <li><strong style={strong}>ProPresenter freezes but the ATEM still shows the last frame</strong> — This is a ProPresenter crash or the computer went to sleep. Set the computer to "never sleep" and check ProPresenter for updates.</li>
        <li><strong style={strong}>Audio from ProPresenter leaks into the stream</strong> — The ATEM is picking up audio from the ProPresenter HDMI input. In ATEM's audio mixer, mute the ProPresenter input channel.</li>
      </ul>

      <h2 style={h2}>Taking It Further with Tally</h2>
      <p style={p}><a href="/signup" style={a}>Tally integrates deeply with both ProPresenter and your ATEM</a> — connecting them through a single control layer:</p>
      <ul style={ul}>
        <li><strong style={strong}>Advance slides from Telegram</strong> — Type "next slide" or "go to slide 5" and Tally sends the command to ProPresenter. No need to be at the computer.</li>
        <li><strong style={strong}>Trigger looks remotely</strong> — Activate ProPresenter looks (screen layouts) from your phone. Switch between "worship mode" and "sermon mode" without touching ProPresenter.</li>
        <li><strong style={strong}>Send stage messages</strong> — Type a message in Telegram and it appears on the stage display for your pastor. "2 minutes left" or "communion after this song."</li>
        <li><strong style={strong}>Start and control timers</strong> — Launch countdown timers on the stage display from your phone. Great for keeping the service on schedule.</li>
        <li><strong style={strong}>Autopilot rules</strong> — Set up automations like "when ProPresenter triggers a worship look, switch ATEM to Camera 1 and enable keyer." Your production runs itself during predictable moments.</li>
        <li><strong style={strong}>Crash detection</strong> — If ProPresenter crashes or becomes unresponsive, Tally detects it and alerts your TD immediately. No more finding out when the lyrics don't appear on screen.</li>
      </ul>
      <p style={p}><a href="/signup" style={a}>Start a free trial</a> and connect ProPresenter + ATEM in a single unified dashboard.</p>
    </>
  );
}

/* ── Post 9 ── */
function ChurchAudioStreaming() {
  return (
    <>
      <p style={p}>Viewers will tolerate a shaky camera. They will not tolerate bad audio. If your church live stream sounds hollow, distorted, or silent — people leave within seconds. Getting your audio mix right for streaming is the single most impactful upgrade most churches can make. Here's how to do it.</p>

      <h2 style={h2}>Why Stream Audio Is Different from Room Audio</h2>
      <p style={p}>Your front-of-house (FOH) mix is designed for a room full of people sitting 20-100 feet from the speakers. The stream mix is heard through earbuds, phone speakers, and laptop speakers — inches from the listener's ears. These are fundamentally different listening environments.</p>
      <ul style={ul}>
        <li><strong style={strong}>Room mix is reinforcement</strong> — It supplements what the congregation already hears acoustically. Vocals are loud, instruments are lower because the acoustic sound fills the room.</li>
        <li><strong style={strong}>Stream mix needs everything</strong> — Online listeners hear only what's in the mix. If the acoustic guitar isn't in the stream feed, they don't hear it at all.</li>
        <li><strong style={strong}>Room mix tolerates dynamics</strong> — A loud moment in the room is exciting. The same dynamic spike on earbuds is painful.</li>
      </ul>
      <p style={p}>This is why sending a direct copy of your FOH mix to the stream often sounds bad. It's mixed for a different context.</p>

      <h2 style={h2}>The Ideal Setup: A Dedicated Stream Mix</h2>
      <p style={p}>If your console supports it, create a separate aux mix or bus for the stream. Most modern digital consoles can do this:</p>
      <ul style={ul}>
        <li><strong style={strong}>Behringer X32 / Midas M32</strong> — Use a mix bus (e.g., Bus 15-16 as a stereo pair) routed to an XLR or 1/4" output</li>
        <li><strong style={strong}>Allen & Heath dLive / SQ</strong> — Assign a mix send for stream output</li>
        <li><strong style={strong}>Yamaha CL/QL/TF</strong> — Use a matrix or mix bus with dedicated output</li>
      </ul>
      <p style={p}>The stream mix should include every instrument and voice at a balanced level. Think of it like mixing for a studio recording — everything present, nothing overpowering.</p>

      <h3 style={h3}>If You Can't Do a Separate Mix</h3>
      <p style={p}>Many smaller churches have a board with limited outputs. In that case, use a <strong style={strong}>post-fader aux send</strong> from the main mix. This follows your FOH fader movements (so mutes and level changes carry over) but lets you adjust the overall send level independently. It's not ideal, but it's better than a direct tap off the main output.</p>

      <h2 style={h2}>Getting Audio Into Your Stream</h2>
      <p style={p}>Your audio has to get from the soundboard to wherever it enters the stream. Here are the common paths:</p>

      <h3 style={h3}>Option 1: Audio Embedder → ATEM</h3>
      <p style={p}>An HDMI audio embedder takes your board's analog output (XLR or 1/4") and mixes it into an HDMI signal. Connect the embedder to an ATEM input, and the audio rides with the HDMI signal. This is the cleanest approach if you're using an ATEM — one cable, no sync issues.</p>

      <h3 style={h3}>Option 2: USB Audio Interface → OBS</h3>
      <p style={p}>Run an XLR or 1/4" cable from your board's stream output to a USB audio interface (like a Focusrite Scarlett Solo — about $80). The interface connects to your streaming computer via USB. In OBS, select the interface as your audio input. This gives you level meters and per-source control in OBS.</p>

      <h3 style={h3}>Option 3: ATEM 3.5mm Mic Input</h3>
      <p style={p}>The ATEM Mini has a 3.5mm mic input. You can run a cable from your board's headphone or aux out to this input with an adapter. It works, but the 3.5mm input is noisy and doesn't give you much level control. Use this as a last resort.</p>

      <h3 style={h3}>Option 4: Digital Direct (Dante, AES67, USB)</h3>
      <p style={p}>If your console supports Dante or USB direct out, you can send a digital stream directly to your encoder computer. Zero analog conversion, zero noise. Dante requires a Dante Virtual Soundcard license or a Dante-to-USB adapter. This is the highest quality option for churches with digital consoles.</p>

      <h2 style={h2}>Mixing Tips for Church Streaming</h2>
      <ul style={ul}>
        <li><strong style={strong}>Compress more than you think</strong> — Stream audio benefits from heavier compression than room audio. A 3:1 ratio on vocals and 4:1 on drums keeps the dynamic range manageable for earbuds. Your FOH engineer might wince, but online listeners will thank you.</li>
        <li><strong style={strong}>Roll off the lows</strong> — Cut everything below 80 Hz on vocals, 60 Hz on guitars. Low-frequency rumble that's barely audible in the room is boomy and muddy on earbuds. Use a high-pass filter on every channel in your stream mix.</li>
        <li><strong style={strong}>Check on earbuds</strong> — Mix on studio monitors if you have them, but always check on consumer earbuds before Sunday. AirPods, cheap wired earbuds — these are what your viewers use. If it sounds good on those, it'll sound good everywhere.</li>
        <li><strong style={strong}>The pastor's mic is king</strong> — During the sermon, the pastor's voice should be crystal clear with nothing competing. If viewers can't understand the sermon, nothing else matters. Aim for -12 to -6 dBFS on the pastor's voice in your stream output.</li>
        <li><strong style={strong}>Watch your meters</strong> — Stream audio should peak around -6 dBFS and average around -18 to -12 dBFS. If you're hitting 0 dBFS, your stream is clipping and viewers hear digital distortion. If you're averaging -30 dBFS, viewers are cranking their volume and hearing all the noise floor.</li>
        <li><strong style={strong}>Mute the ambient mics during speaking</strong> — Room mics or choir mics that are great during worship add noise and echo during the sermon. Mute them or pull them down significantly when the pastor is speaking.</li>
      </ul>

      <h2 style={h2}>The Biggest Audio Mistakes We See</h2>
      <ol style={ol}>
        <li><strong style={strong}>No audio on stream at all</strong> — The aux send is off, the cable is disconnected, or the ATEM/OBS has the wrong input selected. This happens more often than anyone admits. Test audio before every service.</li>
        <li><strong style={strong}>Double audio (echo)</strong> — Two audio sources active: board feed AND a camera mic. Mute camera mics in the ATEM audio mixer. Always.</li>
        <li><strong style={strong}>Clipping/distortion</strong> — Levels are too hot somewhere in the chain. Turn down the aux send or reduce the output gain until peaks stay below -6 dBFS.</li>
        <li><strong style={strong}>Background hum</strong> — Ground loop between the soundboard and the streaming computer. Use a ground loop isolator ($15 on Amazon) or go fully digital with USB/Dante.</li>
        <li><strong style={strong}>Inconsistent volume between songs and sermon</strong> — The worship team plays at -6 dBFS but the pastor speaks at -24 dBFS. Use compression on the stream bus or ride the master fader. Better yet, use a limiter on the stream output to catch peaks.</li>
      </ol>

      <h2 style={h2}>Monitoring Stream Audio with Tally</h2>
      <p style={p}><a href="/signup" style={a}>Tally monitors your audio console</a> alongside your video gear — so audio problems don't go unnoticed:</p>
      <ul style={ul}>
        <li><strong style={strong}>Audio level monitoring</strong> — Tally tracks whether audio is present in your stream. If the stream goes silent (muted channel, disconnected cable, crashed software), you get an instant alert on Telegram.</li>
        <li><strong style={strong}>Full mixer control from your phone</strong> — Adjust faders, EQ, compression, gates, and mute/solo on every channel from Telegram. Works with Allen & Heath, Behringer X32, Midas M32, and Yamaha consoles.</li>
        <li><strong style={strong}>Preset recall</strong> — Save your stream mix as a preset and recall it with one command. "Load stream preset" brings every fader, EQ setting, and bus level back to your proven configuration.</li>
        <li><strong style={strong}>Pre-service audio check</strong> — Tally verifies your audio console is online and responding 30 minutes before service. If the console lost power or the network cable came loose, you know before the worship team starts playing.</li>
      </ul>
      <p style={p}>Audio is the foundation of a good stream. Get the mix right, monitor it actively, and your online congregation hears every word. <a href="/signup" style={a}>Start a free trial</a> and connect your audio console to Tally in under 10 minutes.</p>
    </>
  );
}

/* ── Post 11 ── */
function StreamFirstTenMinutes() {
  return (
    <>
      <p style={p}>Most church stream failures happen before the sermon starts. The first ten minutes after you go live are when keys fail, audio is muted, bitrate collapses, and nobody is watching the encoder because they are still seating ushers.</p>
      <p style={p}>A short pre-service checklist — run the same way every Sunday — catches those failures while there is still time to fix them. This is the booth version: what to check, in what order, and what “good” looks like.</p>

      <h2 style={h2}>Why the First Ten Minutes Are Fragile</h2>
      <p style={p}>The booth is busiest right when the stream is most fragile. Worship is starting, cameras are moving, and the encoder has just connected to YouTube or Facebook. That is also when these failures cluster:</p>
      <ul style={ul}>
        <li><strong style={strong}>Stale stream key</strong> — The platform reset it, or last week’s private rehearsal key is still pasted in.</li>
        <li><strong style={strong}>Silent first song</strong> — Aux send is down, ATEM audio is muted, or OBS is still on the camera mic.</li>
        <li><strong style={strong}>Bitrate never climbs</strong> — The encoder connected, but upload is saturated by lobby Wi-Fi or a Windows update.</li>
        <li><strong style={strong}>Wrong scene / black input</strong> — HDMI woke up late. Program is a black frame for the first two minutes.</li>
        <li><strong style={strong}>Nobody is watching the stream</strong> — The only confirmation is a green “LIVE” badge on the encoder, which can lie.</li>
      </ul>
      <blockquote style={bq}>A stream that looks “live” on the encoder and is silent or black on the platform is already a failure. Confirm on a phone that is not on the church Wi-Fi.</blockquote>

      <h2 style={h2}>T-30 to T-0: The Same Sequence Every Week</h2>
      <p style={p}>Print this. Laminate it. Do not invent a new order when you are late.</p>

      <h3 style={h3}>30 minutes out — Power and network</h3>
      <ol style={ol}>
        <li>Power the switcher, cameras, audio interface, and encoder in the documented order. Wait for each one to finish booting before you move on.</li>
        <li>Confirm the AV switch has link lights. Ping the ATEM and encoder if you have a terminal handy.</li>
        <li>Open the streaming software. Confirm the destination and stream key match this week’s event — not last week’s rehearsal.</li>
      </ol>

      <h3 style={h3}>15 minutes out — Picture and sound</h3>
      <ol style={ol}>
        <li>Frame cameras on their Sunday presets. Switch each input on the ATEM and confirm it is not black.</li>
        <li>Send tone or a spoken mic through the stream mix. Watch meters on the board, the ATEM, and OBS. All three should move.</li>
        <li>Start a 20-second test stream (unlisted or a test key). Watch it on a phone on cellular. Confirm video, audio, and lip sync, then stop it.</li>
      </ol>

      <h3 style={h3}>5 minutes out — Go-live gate</h3>
      <ol style={ol}>
        <li>Clear the test stream. Confirm the real event is selected on YouTube / Facebook / Vimeo.</li>
        <li>Confirm recording is armed (USB on the ATEM, or the OBS recording path has free space).</li>
        <li>Assign one person — not the camera op — to watch the public stream for the first two songs.</li>
      </ol>

      <h2 style={h2}>The 10-Minute Watch After You Go Live</h2>
      <p style={p}>Going live is not the finish line. For the next ten minutes, that assigned person checks three things on a phone:</p>
      <ul style={ul}>
        <li><strong style={strong}>Picture</strong> — Not black, not a frozen frame, not the wrong scene.</li>
        <li><strong style={strong}>Sound</strong> — Vocals present, no echo from a second mic, no clipping.</li>
        <li><strong style={strong}>Stability</strong> — Bitrate holds near your target (for most churches, 4,000–6,000 kbps at 1080p). If it keeps diving under 2,000, you have an upload problem.</li>
      </ul>
      <p style={p}>If any of those fail, fix it immediately — do not wait for the sermon. Restart the encoder, unmute the aux, or drop bitrate. The <a href="/blog/church-streaming-troubleshooting" style={a}>troubleshooting guide</a> covers the common repairs; the point here is to notice the problem while the room is still settling.</p>

      <h2 style={h2}>What “Good” Looks Like on Paper</h2>
      <p style={p}>A useful checklist is specific to your booth. Fill in the blanks once, then stop rewriting it every week:</p>
      <ul style={ul}>
        <li>ATEM IP: ________ (static — see the <a href="/blog/church-av-network-setup-guide" style={a}>AV network guide</a>)</li>
        <li>Encoder / OBS machine: ________</li>
        <li>Stream target: ________ kbps, 1080p, wired ethernet only</li>
        <li>Audio path: board aux → ________ → ATEM / OBS</li>
        <li>Who watches the first 10 minutes: ________</li>
        <li>Who to text if it is red: ________</li>
      </ul>
      <p style={p}>If a volunteer cannot finish this list without you, the list is not done yet. Pair it with the <a href="/blog/church-production-volunteer-training" style={a}>volunteer training playbook</a> so the same person is not the only one who knows the sequence.</p>

      <h2 style={h2}>The Failure You Cannot See From the Booth</h2>
      <p style={p}>The booth monitors program. They do not tell you whether YouTube is actually ingesting. A phone in the lobby on church Wi-Fi is also a weak check — it often shares the same congested uplink.</p>
      <p style={p}>Use cellular, or a monitor that reads encoder health and platform status. <a href="/signup" style={a}>Tally</a> runs a device check about 30 minutes before the scheduled service and watches bitrate, audio presence, and stream health after you go live. If the first song is silent or the ingest drops, the on-call TD gets a Slack or Telegram alert instead of a text 20 minutes later.</p>

      <h2 style={h2}>Sunday Takeaway</h2>
      <p style={p}>Pick one person. Give them this list. Have them watch the public stream for ten minutes after go-live, every week, even when nothing is wrong. The weeks nothing is wrong are how you find the weeks something is.</p>
      <p style={p}>If you want that first-ten-minutes watch to happen even when the assigned volunteer is late, <a href="/signup" style={a}>start a free Tally trial</a> and put the pre-service check on a schedule.</p>
    </>
  );
}

/* ── Post 12 ── */
function StreamDroppedMidSermon() {
  return (
    <>
      <p style={p}>The pastor is 12 minutes into the sermon and a text comes in: “Stream is offline.” Do not rebuild the booth. Do not explain RTMP to the room. You need a short playbook that gets picture and sound back, then a debrief after amen.</p>
      <p style={p}>This is the mid-service incident path — what to do in the first 60 seconds, what to try next, and what to leave alone until the service ends.</p>

      <h2 style={h2}>First 60 Seconds: Confirm, Then Restart</h2>
      <p style={p}>One person talks. Everyone else stays on their job (cameras, lyrics, audio). Panic is a second outage.</p>
      <ol style={ol}>
        <li><strong style={strong}>Confirm on the platform, not the encoder.</strong> Open YouTube Studio or Facebook Live Producer on a phone. Frozen preview plus “offline” is real. A green OBS button with a dead platform is still a real outage.</li>
        <li><strong style={strong}>Tell the room once.</strong> If you have comms: “Stream is down. Restarting. Do not change cameras.” If you do not have comms, a sticky note on the confidence monitor is enough. The pastor does not need a play-by-play.</li>
        <li><strong style={strong}>Restart the stream only.</strong> In OBS: Stop Streaming → wait 5 seconds → Start Streaming. On an ATEM Mini Pro: ON AIR off, then on. On a hardware encoder: stop / start the publish, not a full reboot — yet.</li>
      </ol>
      <p style={p}>Most mid-sermon drops come back on that first restart. Watch the platform for 20–30 seconds. If viewers return, stay put. Do not keep clicking.</p>

      <h2 style={h2}>If the Restart Does Not Hold</h2>
      <p style={p}>Work the chain from the internet toward the camera. Change one thing at a time.</p>

      <h3 style={h3}>1. Upload path</h3>
      <ul style={ul}>
        <li>Confirm the ethernet link light on the encoder. If you are on Wi-Fi, you already found the problem — plug in if a cable exists.</li>
        <li>Drop bitrate one step (6,000 → 4,500 → 3,000 kbps) and start again. A stream that holds at 3,000 is better than one that dies at 6,000.</li>
        <li>Close anything else using the uplink: lobby livestream on a laptop, cloud backup, a phone hotspot sharing the same modem.</li>
      </ul>

      <h3 style={h3}>2. Encoder</h3>
      <ul style={ul}>
        <li>If OBS is frozen, force-quit and reopen. Start streaming before you restore extra browser sources.</li>
        <li>If a Teradek, YoloBox, or AJA HELO will not republish, power-cycle that box only. Leave the ATEM and the soundboard running.</li>
        <li>Confirm the stream key did not change. A mid-service “invalid key” usually means someone opened the wrong event on a phone.</li>
      </ul>

      <h3 style={h3}>3. Picture and sound into the encoder</h3>
      <ul style={ul}>
        <li>If the encoder is live but the platform is black, cut to a known-good camera. Troubleshoot the dead input after service.</li>
        <li>If the platform is live but silent, check the board aux and the ATEM audio mixer — not the pastor’s handheld. See the <a href="/blog/church-audio-live-streaming-guide" style={a}>stream mix guide</a>.</li>
      </ul>
      <p style={p}>The longer <a href="/blog/church-streaming-troubleshooting" style={a}>10-problem troubleshooting list</a> is for after you have picture back. During the sermon, your only job is a stable encode.</p>

      <h2 style={h2}>What Not to Do While the Pastor Is Talking</h2>
      <ul style={ul}>
        <li><strong style={strong}>Do not reboot the ATEM</strong> unless program is already dead in the room. A switcher reboot drops IMAG and the stream together.</li>
        <li><strong style={strong}>Do not “fix” ProPresenter</strong> unless lyrics are the outage. A crash-restart of slides in the middle of a point is a second incident.</li>
        <li><strong style={strong}>Do not announce it from the stage</strong> unless the outage will last the rest of the service. Online viewers already know. The room does not need to.</li>
        <li><strong style={strong}>Do not keep a failed destination open.</strong> If YouTube will not ingest after two clean restarts, start a new event or fail over to the backup destination you already tested. Do not invent a new platform on the fly.</li>
      </ul>

      <h2 style={h2}>Roles So One Volunteer Is Not the Whole Plan</h2>
      <p style={p}>Write three names on the run sheet. If a name is empty, that is the real risk — not the encoder.</p>
      <ul style={ul}>
        <li><strong style={strong}>Booth lead</strong> — Restarts the encoder. Speaks on comms.</li>
        <li><strong style={strong}>Watcher</strong> — Stays on the public stream (cellular if possible) and says when it is actually back.</li>
        <li><strong style={strong}>On-call TD</strong> — Gets the text / Slack / Telegram. Decides whether to walk to the booth or talk someone through it.</li>
      </ul>
      <p style={p}>If the TD is in the congregation, they should not learn about the outage from a Facebook comment. That is an alerts problem, not a courage problem. <a href="/signup" style={a}>Tally</a> watches ingest and encoder health and can restart OBS, vMix, or a hardware encoder after it confirms a real drop — then notifies Slack or Telegram with what it did.</p>

      <h2 style={h2}>After Amen: 10-Minute Debrief</h2>
      <p style={p}>Write four lines before anyone powers down:</p>
      <ol style={ol}>
        <li>What viewers saw (black, freeze, silent, offline).</li>
        <li>What you changed (stop/start, bitrate, power cycle, new event).</li>
        <li>When it returned (or did not).</li>
        <li>What you will test on Tuesday (cable, ISP, stream key process, backup destination).</li>
      </ol>
      <p style={p}>If this was a holiday or a one-time overflow venue, a 72-hour Event monitor ($99) is enough to cover rehearsal through the last service. Do not buy a new encoder to avoid writing the debrief.</p>

      <h2 style={h2}>Sunday Takeaway</h2>
      <p style={p}>Confirm on the platform. Restart once. Drop bitrate if it will not hold. Leave the switcher and the sermon alone. Write down what happened before you shut the rack off.</p>
      <p style={p}>If you want the restart to happen before the text thread starts, <a href="/signup" style={a}>try Tally on a free trial</a> and set recovery to auto-restart after a verified drop.</p>
    </>
  );
}

/* ── Post 13 ── */
function OBSChurchCrashRecovery() {
  return (
    <>
      <p style={p}>OBS is free, flexible, and in a lot of church booths. It is also a desktop app sharing a machine with ProPresenter, Chrome, and last night’s Windows update. When it freezes on Sunday, you need a recovery path that does not require a forum thread.</p>
      <p style={p}>This guide is what to watch before service, how to come back from a crash mid-stream, and which OBS settings actually matter in a sanctuary — not a gaming PC.</p>

      <h2 style={h2}>Give OBS a Boring Computer</h2>
      <p style={p}>The highest-leverage OBS change is not a plugin. It is a dedicated machine.</p>
      <ul style={ul}>
        <li><strong style={strong}>Streaming computer does one job.</strong> No email, no Planning Center in Chrome, no lyric software on the same box if you can avoid it.</li>
        <li><strong style={strong}>Never sleep. Never auto-update during the service window.</strong> Pause Windows Update, turn off macOS automatic restarts, disable “put hard disks to sleep.”</li>
        <li><strong style={strong}>Wired ethernet only.</strong> OBS on Wi-Fi will look fine in rehearsal and fail when 200 phones join the lobby network.</li>
        <li><strong style={strong}>Close browser sources you are not using.</strong> A hidden browser source still burns CPU. Duplicate docks and leftover scoreboard URLs are a common Sunday crash.</li>
      </ul>
      <p style={p}>If you must run ProPresenter and OBS on one computer, treat that as a known risk: lower canvas resolution, and have a hardware encoder or ATEM Mini Pro as the backup path. The <a href="/blog/church-live-stream-setup-guide" style={a}>live stream setup guide</a> covers that split.</p>

      <h2 style={h2}>Settings That Keep Church Streams Alive</h2>
      <p style={p}>Open Settings and lock these in once. Volunteers should not discover them at 10:54.</p>

      <h3 style={h3}>Output</h3>
      <ul style={ul}>
        <li><strong style={strong}>Encoder:</strong> Hardware (NVENC, QuickSync, or Apple VT) if the GPU exists. x264 on a tired laptop is how you get a slideshow.</li>
        <li><strong style={strong}>Rate control:</strong> CBR. Churches need a predictable uplink, not a quality spike during the loudest song.</li>
        <li><strong style={strong}>Bitrate:</strong> Start at 4,500 kbps for 1080p30. Only go to 6,000 if a Sunday speed test shows at least 12 Mbps upload with headroom.</li>
        <li><strong style={strong}>Keyframe interval:</strong> 2 seconds. Platforms expect it. Longer intervals make a reconnect look broken for longer.</li>
      </ul>

      <h3 style={h3}>Advanced</h3>
      <ul style={ul}>
        <li>Enable <strong style={strong}>Dynamically change bitrate</strong> only if your ISP is unstable and you have already dropped the target. It is a safety net, not a substitute for ethernet.</li>
        <li>Set a <strong style={strong}>reconnect</strong> timeout you will actually wait through — 10 seconds is enough. Do not stack three destinations that all retry forever on a dead uplink.</li>
        <li>Recording path on a different drive than the OS if you record locally. A full C: drive kills OBS and the stream together.</li>
      </ul>

      <h2 style={h2}>What to Watch While You Are Live</h2>
      <p style={p}>The OBS status bar is the booth instrument cluster. Glance at it the way you glance at audio meters:</p>
      <ul style={ul}>
        <li><strong style={strong}>Dropped frames (network)</strong> — Climbing numbers mean the uplink, not the sermon. Drop bitrate or find the machine using the WAN.</li>
        <li><strong style={strong}>Skipped frames (encoding)</strong> — The computer cannot encode in time. Kill browser sources, switch to hardware encode, or drop to 720p.</li>
        <li><strong style={strong}>CPU</strong> — Sustained 80%+ is a crash preview. Something else is running.</li>
        <li><strong style={strong}>Audio meters</strong> — If they freeze, OBS is frozen even if the preview still shows a last frame.</li>
      </ul>
      <blockquote style={bq}>A still preview is not proof of life. Confirm the platform ingest or an encoder health view. The preview can sit on the last good frame after the process has wedged.</blockquote>

      <h2 style={h2}>Crash Recovery Without Making It Worse</h2>
      <ol style={ol}>
        <li>Wait five seconds. If the window is “Not Responding,” do not keep clicking Start Streaming.</li>
        <li>Force-quit OBS. Reopen it. It should reload the last scene collection.</li>
        <li>Check audio meters first. Then Start Streaming. Then Start Recording if you use it.</li>
        <li>Confirm on the platform (phone, cellular). If the event ended, start the same event again or a new one — do not paste a second key into a still-open session.</li>
        <li>Leave extra docks and browser sources off until the encode is stable.</li>
      </ol>
      <p style={p}>If OBS crashes twice in one service, fail over. ATEM Mini Pro ethernet stream, a Teradek, or a YoloBox that is already keyed is better than a third reboot. After service, check the crash report in Help → Crash Reports and the Windows Reliability Monitor. Repeated crashes after an OS update are usually the update.</p>

      <h2 style={h2}>A Small Scene Collection Beats a Clever One</h2>
      <p style={p}>Church OBS scenes fail when they try to be a TV truck:</p>
      <ul style={ul}>
        <li>One <strong style={strong}>Program</strong> scene that receives the ATEM (or the single camera).</li>
        <li>One <strong style={strong}>Holding / countdown</strong> scene.</li>
        <li>One <strong style={strong}>Lower-third or lyrics</strong> scene if you key in OBS instead of the ATEM.</li>
        <li>No nested collections, no weekly “Easter 2019 leftover,” no untested plugin.</li>
      </ul>
      <p style={p}>Export the profile and scene collection after a good Sunday. That file is the restore path when a volunteer “cleaned up” the scenes. Store it next to the <a href="/blog/church-stream-first-10-minutes-checklist" style={a}>pre-service checklist</a>.</p>

      <h2 style={h2}>When a Reliability Layer Helps</h2>
      <p style={p}>OBS will not page you when it dies. Someone has to be looking. <a href="/signup" style={a}>Tally</a> watches OBS status, CPU, bitrate, and whether the stream is actually up. If the process exits or ingest drops, it can restart the stream and send Slack or Telegram with the diagnosis so the TD is not guessing from the pew.</p>
      <p style={p}>That does not replace a dedicated machine. It replaces hoping a volunteer notices the status bar.</p>

      <h2 style={h2}>Sunday Takeaway</h2>
      <p style={p}>Dedicated PC, CBR, hardware encode, 2-second keyframes, one person watching dropped frames. If OBS wedges: force-quit, start stream, confirm on the platform, stop adding sources.</p>
      <p style={p}><a href="/signup" style={a}>Start a free trial of Tally</a> if you want OBS health on the same dashboard as the ATEM.</p>
    </>
  );
}

/* ── Post 14 ── */
function EncoderRtmpReliability() {
  return (
    <>
      <p style={p}>Your switcher can be perfect and the stream still dies. The encoder — OBS, a Teradek, YoloBox, Epiphan, or an AJA HELO — is the device that has to keep an RTMP session alive for 70 minutes on a church uplink that was never designed for that.</p>
      <p style={p}>This is a reliability guide: bitrate math, reconnect behavior, and how to know the encoder failed before viewers start commenting.</p>

      <h2 style={h2}>RTMP Is a Long Handshake, Not a File Upload</h2>
      <p style={p}>RTMP (and the SRT/RTMPS variants many boxes now speak) is a persistent connection. If the session drops, viewers do not get a graceful “we will be right back” unless you built one. They get a freeze, then offline.</p>
      <ul style={ul}>
        <li><strong style={strong}>The platform must keep receiving packets.</strong> A 15-second gap is often enough for YouTube to end the event.</li>
        <li><strong style={strong}>Reconnect is not instant.</strong> DNS, auth, and keyframe wait can take 10–30 seconds even when the box says “live.”</li>
        <li><strong style={strong}>Two destinations double the failure modes.</strong> Dual-streaming to YouTube and Facebook from one box is fine only if the uplink can carry both bitrates plus 50% headroom.</li>
      </ul>

      <h2 style={h2}>Bitrate: Pick a Number You Can Defend</h2>
      <p style={p}>Run a wired speed test from the encoder network — not a phone on guest Wi-Fi — on a Sunday-shaped morning (lobby already filling). Then:</p>
      <ul style={ul}>
        <li><strong style={strong}>Available upload ÷ 2 = your max total encode.</strong> If the test says 20 Mbps, you do not get a 12 Mbps stream. You get ~8–10 Mbps of total encode, split across destinations.</li>
        <li><strong style={strong}>1080p30 church speech:</strong> 4,000–6,000 kbps is enough. Going to 8,000 rarely looks better on a phone and fails more often.</li>
        <li><strong style={strong}>720p30:</strong> 2,500–4,000 kbps. Use this when the ISP is the weak link, not when you are ashamed of 720.</li>
        <li><strong style={strong}>CBR, not VBR,</strong> on hardware encoders that offer both. Worship dynamics plus VBR is how you spike the modem during the loudest chorus.</li>
      </ul>
      <p style={p}>Write the target bitrate on the encoder and in the booth checklist. Volunteers should not “turn it up because it looked soft last week.” Soft is a lighting and camera problem. See the <a href="/blog/best-ptz-cameras-for-church" style={a}>PTZ guide</a> before you tax the WAN.</p>

      <h2 style={h2}>Hardware vs Software: Failure Modes Differ</h2>
      <h3 style={h3}>Software (OBS, vMix, Ecamm)</h3>
      <p style={p}>Fails when the OS is busy. You get skipped frames, a frozen UI, or a process exit. Recovery is restart the app and republish. Keep a <a href="/blog/obs-church-streaming-crash-recovery" style={a}>crash path for OBS</a> on the wall.</p>

      <h3 style={h3}>Hardware (Teradek, YoloBox, Epiphan, AJA HELO, ATEM Mini Pro)</h3>
      <p style={p}>Fails when the session drops and the box sits on a stale “connected” state, or when the HDMI input blinks and the encode keeps sending black. Recovery is often:</p>
      <ol style={ol}>
        <li>Stop / start the publish (do not reboot first).</li>
        <li>Confirm the destination URL and key — especially after a firmware update that cleared presets.</li>
        <li>Power-cycle the encoder only if stop/start failed twice. Leave the switcher up.</li>
      </ol>
      <p style={p}>Give every hardware encoder a static IP and a label on the rack. If you cannot open its web UI from the booth PC, you cannot fix it from the pew either. The <a href="/blog/church-av-network-setup-guide" style={a}>AV network setup guide</a> is the prerequisite.</p>

      <h2 style={h2}>Reconnect Settings Worth Setting Once</h2>
      <ul style={ul}>
        <li><strong style={strong}>Auto-reconnect on.</strong> Off is how a 4-second ISP blip becomes a 40-minute outage.</li>
        <li><strong style={strong}>Limited retries.</strong> Infinite retry on a dead key just delays the moment you notice.</li>
        <li><strong style={strong}>Backup destination.</strong> A second RTMP target (even unlisted YouTube) that you tested on a weeknight. Mid-service is a bad time to create a Facebook Live identity.</li>
        <li><strong style={strong}>Bonding / dual-SIM</strong> on Teradek-class units only if you have actually failed the primary WAN in rehearsal. An untested bonded path is a second unknown.</li>
      </ul>

      <h2 style={h2}>How You Know the Encoder Failed</h2>
      <p style={p}>Do not trust a glowing LED. Check, in this order:</p>
      <ol style={ol}>
        <li>Platform ingest (Studio / Live Producer) — seconds of delay, but it is ground truth for viewers.</li>
        <li>Encoder stats — bitrate, dropped packets, last keyframe. If bitrate is 0 and the LED is green, believe the number.</li>
        <li>Input lock — HDMI/SDI “unlocked” means you are encoding black.</li>
      </ol>
      <p style={p}><a href="/signup" style={a}>Tally</a> reads those encoder metrics (OBS, vMix, and hardware boxes including Teradek, YoloBox, Epiphan, and AJA HELO) with green/yellow/red thresholds. When bitrate falls off or the session ends, it can restart the publish and alert Slack or Telegram instead of waiting for a comment.</p>

      <h2 style={h2}>A Simple Encoder Standard</h2>
      <ul style={ul}>
        <li>One primary encoder, one documented backup path.</li>
        <li>Same destination names and key storage location every week (password manager, not a text file on the desktop).</li>
        <li>Firmware updates on Tuesday, never Saturday night.</li>
        <li>A recorded 10-minute encode to disk every month so you know the box still writes files if the WAN dies.</li>
      </ul>
      <p style={p}>Special services (Easter, Christmas, a conference in the gym) are when you add a second encoder, not when you change brands. If you only need coverage for that weekend, Event monitoring is $99 for 72 hours — cheaper than a panic-buy that nobody can configure at 11 p.m.</p>

      <h2 style={h2}>Sunday Takeaway</h2>
      <p style={p}>Half your measured upload is your bitrate budget. CBR. Auto-reconnect on. Confirm ingest, not LEDs. Power-cycle the encoder last, not first.</p>
      <p style={p}><a href="/signup" style={a}>Start a free Tally trial</a> to put encoder bitrate and stream health next to the rest of the booth.</p>
    </>
  );
}

/* ── Post 15 ── */
function ServiceRundownBooth() {
  return (
    <>
      <p style={p}>A Planning Center plan tells the room what happens next. The booth needs a different document: when to cut, when to roll the stream, when lyrics come down, and who speaks if something breaks. That is a run of show — not a sermon outline.</p>
      <p style={p}>Build one page the volunteer can follow with a finger. Then run it the same way every Sunday so the stream and the room stay in the same service.</p>

      <h2 style={h2}>What Belongs on a Booth Rundown</h2>
      <p style={p}>If a row does not change a button, a camera, or a stream state, it does not belong here. Keep the pastor’s notes in Planning Center.</p>
      <ul style={ul}>
        <li><strong style={strong}>Clock time</strong> — Hard starts only (10:00 welcome, 10:24 sermon). Soft song lengths stay as “~4 min,” not fake precision.</li>
        <li><strong style={strong}>Program look</strong> — Wide, pastor close-up, lyrics key, full-screen graphic, announcement loop.</li>
        <li><strong style={strong}>Stream state</strong> — Countdown, go live, holding slide, stop. Write the go-live row in bold. That is the row people miss.</li>
        <li><strong style={strong}>Audio note</strong> — Worship aux vs sermon (ambient mics down). One line is enough.</li>
        <li><strong style={strong}>Owner</strong> — Initials. A row with no owner is how two people cut at once.</li>
      </ul>

      <h2 style={h2}>A Service That Fits on One Page</h2>
      <p style={p}>Adapt the times. Do not add a second page until this one is boring.</p>
      <ol style={ol}>
        <li><strong style={strong}>9:30</strong> — Power-on and <a href="/blog/church-stream-first-10-minutes-checklist" style={a}>pre-service checks</a>. Stream is not live.</li>
        <li><strong style={strong}>9:50</strong> — Countdown / welcome loop on program. Cameras on presets. Stream still not live unless you publish the countdown on purpose.</li>
        <li><strong style={strong}>9:58</strong> — Go live. Watcher on cellular for picture and sound.</li>
        <li><strong style={strong}>10:00</strong> — Welcome. Wide shot. Lyrics key off.</li>
        <li><strong style={strong}>10:04</strong> — Worship. Wide + lyrics key (or ProPresenter input). See the <a href="/blog/propresenter-atem-integration-guide" style={a}>ProPresenter + ATEM guide</a> if that key is still a weekly fight.</li>
        <li><strong style={strong}>10:22</strong> — Seat / transition. Key off. Hold wide.</li>
        <li><strong style={strong}>10:24</strong> — Sermon. Pastor close-up. Ambient mics down. No surprise graphics unless they are on the plan.</li>
        <li><strong style={strong}>After amen</strong> — Closing song look. Then holding slide. Stop stream. Stop record. Do not power-cycle until files are saved.</li>
      </ol>
      <blockquote style={bq}>If the booth rundown and the Planning Center order disagree, Planning Center wins for the room — and you update the booth page on Tuesday, not during the welcome.</blockquote>

      <h2 style={h2}>Cues Volunteers Can Hit Under Pressure</h2>
      <p style={p}>Translate “looks” into the buttons you actually have:</p>
      <ul style={ul}>
        <li><strong style={strong}>ATEM macros</strong> named Worship, Sermon, Announcements — not Macro 3.</li>
        <li><strong style={strong}>Companion pages</strong> that match those names if you use a Stream Deck. One button, one look.</li>
        <li><strong style={strong}>ProPresenter look + ATEM input</strong> as a single cue, not two people counting down “three, two, one.”</li>
      </ul>
      <p style={p}>The volunteer should be able to run the service by moving down the page and pressing the named button for that row. If they need a paragraph of explanation, the cue is too clever.</p>

      <h2 style={h2}>Timing Without a Stopwatch Cult</h2>
      <p style={p}>Services run long. The rundown still helps:</p>
      <ul style={ul}>
        <li>Mark <strong style={strong}>hard starts</strong> (sermon, baptism, dismissal) and let worship flex.</li>
        <li>Put a <strong style={strong}>latest go-live</strong> time on the page. If you are not live by then, the watcher says so out loud.</li>
        <li>After service, jot actual times in the margin once. Three weeks of margins tell you whether the sermon start is fantasy.</li>
      </ul>
      <p style={p}>If you already build the order in a doc, you do not have to retype it. Tally’s rundown planner can import a PDF or Word file and run live show mode with elapsed / remaining timers — useful when the booth and a confidence monitor need the same clock. Use it if it replaces a spreadsheet you already fight. Do not add a third plan.</p>

      <h2 style={h2}>When the Plan Breaks Mid-Service</h2>
      <p style={p}>The rundown is not in charge of incidents. Point to the <a href="/blog/church-stream-dropped-mid-sermon" style={a}>mid-sermon playbook</a> in the footer of the page:</p>
      <ul style={ul}>
        <li>Stream offline → restart encoder, do not rebuild the rundown.</li>
        <li>Dead camera → cut to the wide you already have. Stay on the current row.</li>
        <li>Skipped song → skip the row. Do not invent a new look.</li>
      </ul>
      <p style={p}>Autopilot — advancing looks on a timer — only helps if the room is actually following that clock. Start with manual GO / Back and one trained lead. Add timer-advance later for the predictable stretches (countdown, sermon hold), not for worship.</p>

      <h2 style={h2}>Sunday Takeaway</h2>
      <p style={p}>One page. Clock, look, stream state, owner. Named macros, not essays. Update it on Tuesday when it disagrees with Planning Center.</p>
      <p style={p}>If you want that rundown on the same system that already watches the encoder, <a href="/signup" style={a}>try Tally</a> and use the planner for the booth clock — not as a second source of truth.</p>
    </>
  );
}

/* ── Post 16 ── */
function CompanionBoothReliability() {
  return (
    <>
      <p style={p}>Bitfocus Companion turns a Stream Deck into the church booth’s muscle memory: one button for the worship look, one for sermon, one to start the stream. It also becomes a single point of failure if the machine sleeps, the page is unnamed, or nobody knows what the red button does.</p>
      <p style={p}>Treat Companion like part of the signal path. This is how to keep it useful on Sunday without turning the deck into a second job.</p>

      <h2 style={h2}>What Companion Should Do in a Church Booth</h2>
      <p style={p}>Companion is a translator. It should fire the same actions you already trust in ATEM, OBS, ProPresenter, and the audio console — not invent a parallel show.</p>
      <ul style={ul}>
        <li><strong style={strong}>Looks, not novelty.</strong> Worship (wide + lyrics key), Sermon (close-up, key off), Announcements (graphic), Emergency wide.</li>
        <li><strong style={strong}>Stream start / stop</strong> on a page that requires a long press or a confirm button. Accidental “Stop Streaming” during the sermon is a real outage.</li>
        <li><strong style={strong}>PTZ presets</strong> you already named on the camera. Companion should recall “Pastor Close,” not “Preset 7.”</li>
        <li><strong style={strong}>Mute / unmute stream mix</strong> only if FOH has agreed. A deck mute the board does not know about will create a silent stream you cannot explain.</li>
      </ul>
      <p style={p}>If a button does not map to a row on the <a href="/blog/church-service-rundown-booth" style={a}>booth rundown</a>, it does not belong on the Sunday page.</p>

      <h2 style={h2}>Build a Sunday Page That Survives Volunteers</h2>
      <ol style={ol}>
        <li><strong style={strong}>One page named Sunday.</strong> Everything else lives on Setup or Rehearsal pages. Volunteers should never see your experimental MIDI page.</li>
        <li><strong style={strong}>Labels in the language of the service.</strong> “Sermon,” not “Cam2 + DSK off + Macro 4.”</li>
        <li><strong style={strong}>Color = state.</strong> Green idle, yellow armed, red live / dangerous. Pick a rule and keep it.</li>
        <li><strong style={strong}>A documented safe button.</strong> Wide shot, lyrics off, stream still live. When someone hits the wrong look, they go here — not into menus.</li>
        <li><strong style={strong}>Export the config after every good change.</strong> Companion → Settings → Export. Date the file. That export is your rewind when a firmware update or a helpful intern resets the deck.</li>
      </ol>

      <h2 style={h2}>The Reliability Checklist</h2>
      <ul style={ul}>
        <li><strong style={strong}>Companion machine does not sleep.</strong> Same rule as OBS. USB decks vanish when the OS sleeps, and they do not always come back clean.</li>
        <li><strong style={strong}>Static IP on the Companion computer</strong> if anything else (a second deck, a satellite surface, or monitoring) talks to it over the network.</li>
        <li><strong style={strong}>Connections use the same IPs as the rest of the booth.</strong> If the ATEM is 192.168.1.10 in Companion and 192.168.1.47 in real life, the buttons will fail after the next DHCP refresh. Fix the network first — <a href="/blog/church-av-network-setup-guide" style={a}>static IPs</a>.</li>
        <li><strong style={strong}>Module versions are pinned on purpose.</strong> Update Companion on a weeknight and press every Sunday button once. Do not update at 10:40.</li>
        <li><strong style={strong}>A paper backup.</strong> The three macros on the ATEM hardware still work if the deck dies. Write that on the rundown.</li>
      </ul>
      <blockquote style={bq}>Companion should make the reliable path faster. If the only way to cut to camera 1 is a Stream Deck, you do not have a switcher — you have a USB dependency.</blockquote>

      <h2 style={h2}>When Buttons Lie</h2>
      <p style={p}>A lit button is feedback from Companion’s view of the world, not always from the device.</p>
      <ul style={ul}>
        <li>If the ATEM button stays on the old camera, check the network before you mash the deck harder.</li>
        <li>If OBS start is “on” and YouTube is offline, believe the platform. Then use the <a href="/blog/church-stream-dropped-mid-sermon" style={a}>mid-sermon playbook</a>.</li>
        <li>If ProPresenter does not advance, look at the ProPresenter computer — Companion cannot wake a sleeping display output.</li>
      </ul>
      <p style={p}>Train volunteers: one press, then look at program. A second press is a new decision, not a better first one.</p>

      <h2 style={h2}>Keep Companion and Monitoring on the Same Side</h2>
      <p style={p}>Companion fires actions. It does not tell you the stream held. Someone still has to watch ingest, audio, and whether the ATEM is reachable.</p>
      <p style={p}><a href="/signup" style={a}>Tally</a> talks to Companion as a control surface and watches the devices those buttons are supposed to move. If a module loses the ATEM or OBS exits, the TD gets Slack or Telegram — useful when the person with the deck is new and the person who built the page is in the second row.</p>
      <p style={p}>Use remote commands for the same named looks you already put on the deck. Do not build a second naming scheme for your phone.</p>

      <h2 style={h2}>Sunday Takeaway</h2>
      <p style={p}>One Sunday page, named looks, a safe wide, exported config, hardware macros as backup. Update modules on Tuesday. If the deck dies, you should still be able to cut a camera.</p>
      <p style={p}><a href="/signup" style={a}>Start a free Tally trial</a> if you want Companion, ATEM, and the encoder on one status view — with alerts when a button’s destination is actually offline.</p>
    </>
  );
}

/* ─── All posts ─── */
export const BLOG_POSTS = [
  {
    slug: 'church-stream-first-10-minutes-checklist',
    title: 'Why Church Streams Die in the First 10 Minutes',
    metaTitle: 'Church Stream First 10 Minutes Checklist — Tally',
    metaDescription: 'Most church stream failures happen just after go-live. A practical pre-service checklist and first-10-minutes watch for the booth.',
    excerpt: 'Keys fail, audio is muted, and bitrate never climbs — usually in the first ten minutes. Here is the Sunday checklist that catches it while you can still fix it.',
    date: '2026-09-04',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '9 min read',
    tags: ['Live Streaming', 'Setup Guide'],
    keywords: ['church stream checklist', 'pre-service streaming checklist', 'church live stream failed', 'go live church stream', 'church streaming first minutes'],
    content: StreamFirstTenMinutes,
  },
  {
    slug: 'church-stream-dropped-mid-sermon',
    title: 'Stream Dropped Mid-Sermon: A Church Booth Playbook',
    metaTitle: 'Church Stream Dropped Mid-Sermon Playbook — Tally',
    metaDescription: 'What to do in the first 60 seconds when the church live stream drops during the sermon — restart order, what not to touch, and a short debrief.',
    excerpt: 'Confirm on the platform, restart once, drop bitrate if it will not hold, and leave the sermon alone. A mid-service playbook for the booth.',
    date: '2026-08-13',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '8 min read',
    tags: ['Troubleshooting', 'Live Streaming'],
    keywords: ['church stream dropped', 'live stream down during service', 'church streaming outage', 'restart church stream', 'mid-service stream failure'],
    content: StreamDroppedMidSermon,
  },
  {
    slug: 'obs-church-streaming-crash-recovery',
    title: 'OBS for Church: Crash Recovery and What to Watch',
    metaTitle: 'OBS Church Streaming Crash Recovery — Tally',
    metaDescription: 'How churches keep OBS stable on Sunday: dedicated machine, CBR settings, status-bar watch, and a clean crash-recovery order.',
    excerpt: 'OBS is in a lot of church booths. Here is what to watch while you are live, and the exact order to recover when the app freezes mid-service.',
    date: '2026-07-08',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '9 min read',
    tags: ['Live Streaming', 'Troubleshooting'],
    keywords: ['OBS church streaming', 'OBS crash church', 'OBS settings church live stream', 'OBS reconnect church', 'church OBS dedicated computer'],
    content: OBSChurchCrashRecovery,
  },
  {
    slug: 'church-encoder-rtmp-reliability',
    title: 'Church Encoder Reliability: RTMP, Bitrate, and Reconnect',
    metaTitle: 'Church Encoder RTMP Reliability Guide — Tally',
    metaDescription: 'Keep church encoders online: bitrate math, Teradek and hardware reconnect, and how to tell a real RTMP drop from a green LED.',
    excerpt: 'The switcher can be fine and the stream still dies. Bitrate budget, reconnect settings, and a simple encoder standard for Sunday.',
    date: '2026-06-03',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '9 min read',
    tags: ['Live Streaming', 'Setup Guide'],
    keywords: ['church encoder', 'RTMP church streaming', 'Teradek church', 'church stream bitrate', 'hardware encoder reconnect'],
    content: EncoderRtmpReliability,
  },
  {
    slug: 'church-service-rundown-booth',
    title: 'Sunday Morning Run of Show for the Church Booth',
    metaTitle: 'Church Booth Run of Show / Service Rundown — Tally',
    metaDescription: 'Build a one-page booth rundown: clock, camera look, stream state, and owner — so volunteers can run Sunday without a second document.',
    excerpt: 'Planning Center is for the room. The booth needs a one-page run of show: when to go live, which look to hit, and who owns each row.',
    date: '2026-05-07',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '8 min read',
    tags: ['Team Management', 'Setup Guide'],
    keywords: ['church service rundown', 'church booth run of show', 'church production cues', 'Sunday service tech rundown', 'church livestream rundown'],
    content: ServiceRundownBooth,
  },
  {
    slug: 'bitfocus-companion-church-booth',
    title: 'Bitfocus Companion for a Reliable Church Booth',
    metaTitle: 'Bitfocus Companion Church Booth Guide — Tally',
    metaDescription: 'Use Bitfocus Companion on Sunday without creating a USB single point of failure — Sunday page, named looks, exports, and hardware backup.',
    excerpt: 'A Stream Deck should make the reliable path faster. How to build a Sunday Companion page, export the config, and keep ATEM macros as backup.',
    date: '2026-04-02',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '8 min read',
    tags: ['Setup Guide', 'Monitoring'],
    keywords: ['Bitfocus Companion church', 'Stream Deck church production', 'Companion ATEM church', 'church booth Stream Deck', 'Companion reliability'],
    content: CompanionBoothReliability,
  },
  {
    slug: 'multisite-church-av-multiple-campuses',
    title: 'Multisite Church AV: How to Run Production Across Campuses Without Losing Your Mind',
    metaTitle: 'Multisite Church AV Guide: Multiple Campuses — Tally',
    metaDescription: 'How to manage church AV production across multiple campuses. Covers gear standardization, volunteer training, remote monitoring, and campus launch checklists.',
    excerpt: 'How to standardize gear, train remote volunteers, and monitor every campus from one dashboard — without being everywhere on Sunday morning.',
    date: '2026-03-09',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '10 min read',
    tags: ['Multisite', 'Setup Guide'],
    keywords: ['multisite church AV', 'church AV multiple campuses', 'multisite church production', 'church campus AV setup', 'multisite church streaming'],
    content: MultisiteChurchAV,
  },
  {
    slug: 'best-ptz-cameras-for-church',
    title: 'Best PTZ Cameras for Church Live Streaming in 2026',
    metaTitle: 'Best PTZ Cameras for Church (2026 Buying Guide) — Tally',
    metaDescription: 'The best PTZ cameras for church production at every budget. Covers optical zoom, low-light performance, SDI vs NDI, mounting tips, and how many cameras your church actually needs.',
    excerpt: 'PTZ cameras are the workhorse of church production. This guide breaks down which cameras to buy at every budget, how many you need, and how to get the most out of them.',
    date: '2026-03-06',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '9 min read',
    tags: ['Cameras', 'Setup Guide'],
    keywords: ['best PTZ cameras for church', 'church PTZ camera 2026', 'PTZ camera buying guide church', 'PTZOptics church', 'church camera setup', 'how many cameras church streaming'],
    content: PTZCameraBuyingGuide,
  },
  {
    slug: 'propresenter-atem-integration-guide',
    title: 'ProPresenter + ATEM: Complete Integration Guide for Churches',
    metaTitle: 'ProPresenter ATEM Integration Guide for Churches — Tally',
    metaDescription: 'How to connect ProPresenter to your Blackmagic ATEM for church production. Covers HDMI setup, luma keying lyrics over cameras, macros, and troubleshooting.',
    excerpt: 'Connect ProPresenter to your ATEM Mini for seamless lyrics, overlays, and automated production workflows. Step-by-step integration guide for churches.',
    date: '2026-03-04',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '10 min read',
    tags: ['ProPresenter', 'ATEM'],
    keywords: ['ProPresenter ATEM setup', 'ProPresenter ATEM Mini', 'church ProPresenter integration', 'ATEM luma key ProPresenter', 'ProPresenter church production'],
    content: ProPresenterATEMGuide,
  },
  {
    slug: 'church-audio-live-streaming-guide',
    title: 'Church Audio for Live Streaming: Getting Your Mix Right',
    metaTitle: 'Church Audio for Live Streaming — Mix Guide (2026) — Tally',
    metaDescription: 'How to get great audio on your church live stream. Covers stream mix vs FOH, audio routing to OBS and ATEM, EQ tips, and the most common audio mistakes churches make.',
    excerpt: 'Viewers will tolerate shaky video but leave immediately for bad audio. Here\'s how to get your church stream mix right — from soundboard routing to final output levels.',
    date: '2026-03-02',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '11 min read',
    tags: ['Audio', 'Live Streaming'],
    keywords: ['church audio live stream', 'church streaming audio setup', 'stream mix vs FOH', 'church audio interface streaming', 'live stream audio church', 'church soundboard to OBS'],
    content: ChurchAudioStreaming,
  },
  {
    slug: 'church-live-stream-setup-guide',
    title: 'Complete Guide to Church Live Streaming in 2026',
    metaTitle: 'Church Live Stream Setup Guide (2026) — Tally',
    metaDescription: 'Step-by-step guide to setting up live streaming at your church. Covers cameras, video switchers, encoders, audio routing, and production monitoring.',
    excerpt: 'Everything you need to know about setting up reliable live streaming at your church — from camera selection to stream monitoring.',
    date: '2026-02-28',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '8 min read',
    tags: ['Live Streaming', 'Setup Guide'],
    keywords: ['church live stream setup', 'church streaming guide 2026', 'how to stream church service', 'church live streaming equipment'],
    content: ChurchLiveStreamGuide,
  },
  {
    slug: 'church-av-network-setup-guide',
    title: 'Church AV Network Setup: Static IPs, Switches, and Reliability',
    metaTitle: 'Church AV Network Setup Guide — Tally',
    metaDescription: 'How to set up a reliable network for your church production gear. Covers static IPs, dedicated switches, VLANs, and the network mistakes that ruin Sunday services.',
    excerpt: 'The #1 reason church production fails on Sunday isn\'t bad equipment — it\'s bad networking. Here\'s how to set it up right.',
    date: '2026-02-28',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '10 min read',
    tags: ['Networking', 'Setup Guide'],
    keywords: ['church AV network setup', 'static IP church production', 'church network switch', 'ATEM network configuration', 'church production network guide'],
    content: NetworkSetupGuide,
  },
  {
    slug: 'atem-mini-church-production-setup',
    title: 'ATEM Mini Setup for Church Production: Step-by-Step',
    metaTitle: 'ATEM Mini Church Setup Guide — Tally',
    metaDescription: 'Step-by-step guide to setting up a Blackmagic ATEM Mini for church live streaming and production. Covers ATEM Mini, Mini Pro, and Mini Extreme.',
    excerpt: 'How to set up the Blackmagic ATEM Mini for your church — from physical connections to streaming configuration and remote monitoring.',
    date: '2026-02-26',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '7 min read',
    tags: ['ATEM', 'Setup Guide'],
    keywords: ['ATEM Mini church setup', 'ATEM Mini Pro church', 'Blackmagic ATEM church production', 'ATEM Mini streaming guide'],
    content: AtemMiniSetup,
  },
  {
    slug: 'church-production-volunteer-training',
    title: 'Training Church Volunteers for Production: A Practical Guide',
    metaTitle: 'Church Production Volunteer Training Guide — Tally',
    metaDescription: 'A practical guide to training church volunteers for production. Covers onboarding, documentation, troubleshooting, and building a reliable tech team.',
    excerpt: 'A practical playbook for onboarding and training church production volunteers — from first shadow shift to independent operation.',
    date: '2026-02-24',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '9 min read',
    tags: ['Team Management', 'Volunteers'],
    keywords: ['church production volunteer training', 'church tech team training', 'volunteer media team church', 'church production onboarding'],
    content: VolunteerTraining,
  },
  {
    slug: 'church-streaming-troubleshooting',
    title: 'Church Streaming Troubleshooting: 10 Common Problems and Fixes',
    metaTitle: 'Church Streaming Troubleshooting Guide — Tally',
    metaDescription: '10 common church live streaming problems and how to fix them fast. Covers stream drops, audio issues, ATEM disconnects, and more.',
    excerpt: 'The 10 most common church streaming problems — and exactly how to fix each one fast, even in the middle of a service.',
    date: '2026-02-22',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '10 min read',
    tags: ['Troubleshooting', 'Live Streaming'],
    keywords: ['church streaming problems', 'live stream troubleshooting church', 'church stream dropped', 'OBS church streaming issues'],
    content: StreamingTroubleshooting,
  },
  {
    slug: 'remote-church-production-monitoring',
    title: 'How to Monitor Your Church Production Remotely',
    metaTitle: 'Remote Church Production Monitoring Guide — Tally',
    metaDescription: 'How to monitor your church live stream and production equipment remotely. Covers stream health, equipment status, alerts, and automatic recovery.',
    excerpt: 'Why you need remote monitoring for your church production — and how to set it up so your team can relax on Sunday morning.',
    date: '2026-02-20',
    author: 'Tally Team',
    authorRole: 'Tally Connect',
    readTime: '7 min read',
    tags: ['Monitoring', 'Remote Control'],
    keywords: ['remote church production monitoring', 'monitor church stream remotely', 'church production monitoring system', 'church AV monitoring'],
    content: RemoteMonitoring,
  },
];

/* ── Helper functions ── */
export function getPostBySlug(slug) {
  return BLOG_POSTS.find(p => p.slug === slug) || null;
}

export function getAllSlugs() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export function getAllTags() {
  const tags = new Set();
  BLOG_POSTS.forEach(p => p.tags.forEach(t => tags.add(t)));
  return [...tags];
}

export function getRelatedPosts(slug, count = 2) {
  const post = getPostBySlug(slug);
  if (!post) return BLOG_POSTS.slice(0, count);
  const others = BLOG_POSTS.filter(p => p.slug !== slug);
  // Prefer posts that share a tag
  const scored = others.map(p => ({
    ...p,
    score: p.tags.filter(t => post.tags.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count);
}
