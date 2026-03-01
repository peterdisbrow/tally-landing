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
      <p style={p}>Once your ATEM is on the network, <a href="/signup" style={a}>Tally auto-discovers it</a> and gives your team remote access to:</p>
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
      <p style={p}>Keep it to one page. If it's longer, volunteers won't read it. Use screenshots from your actual setup, not generic diagrams.</p>

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
      <p style={p}><strong style={strong}>Prevention:</strong> <a href="/signup" style={a}>Tally detects stream drops within seconds</a> and can auto-restart your encoder before viewers notice.</p>

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
      <p style={p}><strong style={strong}>Prevention:</strong> Keep the streaming computer dedicated to streaming. Don't run presentation software, email, or web browsers on the same machine.</p>

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
        <li><a href="/signup" style={a}>Sign up for a free trial</a> — no credit card required</li>
        <li>Install the Tally desktop app on your booth computer (10 minutes)</li>
        <li>Tally auto-discovers your ATEM, OBS, and other equipment</li>
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

/* ─── All posts ─── */
export const BLOG_POSTS = [
  {
    slug: 'church-live-stream-setup-guide',
    title: 'Complete Guide to Church Live Streaming in 2026',
    metaTitle: 'Church Live Stream Setup Guide (2026) — Tally',
    metaDescription: 'Step-by-step guide to setting up live streaming at your church. Covers cameras, video switchers, encoders, audio routing, and production monitoring.',
    excerpt: 'Everything you need to know about setting up reliable live streaming at your church — from camera selection to stream monitoring.',
    date: '2026-02-28',
    author: 'Andrew Disbrow',
    authorRole: 'Founder, Tally',
    readTime: '8 min read',
    tags: ['Live Streaming', 'Setup Guide'],
    keywords: ['church live stream setup', 'church streaming guide 2026', 'how to stream church service', 'church live streaming equipment'],
    content: ChurchLiveStreamGuide,
  },
  {
    slug: 'atem-mini-church-production-setup',
    title: 'ATEM Mini Setup for Church Production: Step-by-Step',
    metaTitle: 'ATEM Mini Church Setup Guide — Tally',
    metaDescription: 'Step-by-step guide to setting up a Blackmagic ATEM Mini for church live streaming and production. Covers ATEM Mini, Mini Pro, and Mini Extreme.',
    excerpt: 'How to set up the Blackmagic ATEM Mini for your church — from physical connections to streaming configuration and remote monitoring.',
    date: '2026-02-26',
    author: 'Andrew Disbrow',
    authorRole: 'Founder, Tally',
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
    author: 'Andrew Disbrow',
    authorRole: 'Founder, Tally',
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
    author: 'Andrew Disbrow',
    authorRole: 'Founder, Tally',
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
    author: 'Andrew Disbrow',
    authorRole: 'Founder, Tally',
    readTime: '7 min read',
    tags: ['Monitoring', 'Remote Control'],
    keywords: ['remote church production monitoring', 'monitor church stream remotely', 'church production monitoring system', 'church AV monitoring'],
    content: RemoteMonitoring,
  },
  {
    slug: 'church-av-network-setup-guide',
    title: 'Church AV Network Setup: Static IPs, Switches, and Reliability',
    metaTitle: 'Church AV Network Setup Guide — Tally',
    metaDescription: 'How to set up a reliable network for your church production gear. Covers static IPs, dedicated switches, VLANs, and the network mistakes that ruin Sunday services.',
    excerpt: 'The #1 reason church production fails on Sunday isn\'t bad equipment — it\'s bad networking. Here\'s how to set it up right.',
    date: '2026-02-28',
    author: 'Andrew Disbrow',
    authorRole: 'Founder, Tally',
    readTime: '10 min read',
    tags: ['Networking', 'Setup Guide'],
    keywords: ['church AV network setup', 'static IP church production', 'church network switch', 'ATEM network configuration', 'church production network guide'],
    content: NetworkSetupGuide,
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
