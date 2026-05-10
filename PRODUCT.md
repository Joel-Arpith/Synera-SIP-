# Product

## Register

product

## Users

Small business owners and their IT-adjacent staff who are not security professionals. They glance at this dashboard periodically throughout the workday, usually on a desktop monitor, often in a moderately lit office environment. They want to know one thing at a glance: is my network safe right now? Secondary users are technically minded freelancers or small IT consultants managing a handful of clients.

## Product Purpose

Synera-SIP is an affordable, self-hosted network intrusion detection system for small businesses that cannot pay enterprise security pricing. A Raspberry Pi on the local network runs Suricata; this dashboard surfaces what Suricata sees. Success looks like a business owner who feels informed and in control without needing to understand what a STUN packet is.

## Brand Personality

Composed. Precise. Quietly capable.

The interface should feel like a tool built by people who take security seriously but don't need to perform urgency to prove it. Think Linear for task management, Raycast for speed and trust. The threat is handled. The dashboard confirms that.

## Anti-references

- Generic SaaS cream: white backgrounds, blue CTA buttons, rounded feature cards. This looks like a landing page for a project management tool, not a security product.
- Hacker neon: green-on-black terminal aesthetics, glowing text, matrix rain. Movie prop energy.
- Bloated legacy SIEM: Splunk-style dashboards with 30 widgets fighting for attention, nested panels, microscopic text.

## Design Principles

1. **Silence is information.** When nothing is wrong, the dashboard should feel calm, not empty. Quiet confidence is the primary emotional state.
2. **One truth per screen.** Each page answers one question. Dashboard: is anything happening? Alert log: what happened? Blocked IPs: who did we stop? No page should answer all three.
3. **Earn the red.** Severity color is a contract. Red and amber appear only when they mean something. Informational alerts do not get attention-grabbing colors.
4. **Familiar over clever.** The interface disappears into the task. Standard navigation, predictable layout, no invented affordances. The owner should never pause to figure out how the UI works.
5. **Density with breathing room.** Security data is inherently dense. Embrace it, but give each data point enough space to be read without squinting.

## Accessibility & Inclusion

WCAG AA minimum. Color alone never conveys state; severity always has a text label alongside the color indicator. Reduced motion respected via prefers-reduced-motion.
