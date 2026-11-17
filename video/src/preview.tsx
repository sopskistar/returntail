import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
} from 'remotion';
const palette = {
  saffron: '#f3bc53',
  plum: '#2e1c36',
  white: '#ffffff',
  ground: '#f5f3f6',
  muted: '#6d5c73',
};
if (typeof document !== 'undefined') {
  const handle = delayRender('Load licensed ReturnTail display font');
  const font = new FontFace('Rethink Sans Variable', `url(${staticFile('rethink.woff2')})`, {
    weight: '400 800',
  });
  font
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
}
const type = { fontFamily: 'Rethink Sans Variable, sans-serif', color: palette.plum };
function Brand({ light = false }: { light?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 88,
        top: 66,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        color: light ? palette.white : palette.plum,
        fontFamily: type.fontFamily,
        fontSize: 45,
        fontWeight: 650,
        letterSpacing: '-.04em',
      }}
    >
      <Img
        src={staticFile(light ? 'mark-light.svg' : 'mark-dark.svg')}
        style={{ width: 46, height: 46 }}
      />
      returntail
    </div>
  );
}
function Footnote() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 35,
        left: 88,
        right: 88,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: type.fontFamily,
        fontSize: 22,
        color: palette.muted,
      }}
    >
      <span>Local application preview — no funds transferred</span>
      <span>Mainnet proof pending</span>
    </div>
  );
}
function Entrance({ children }: { children: React.ReactNode }) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(f, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(f, [0, 18], [14, 0], { extrapolateRight: 'clamp' })}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
function Opening() {
  return (
    <AbsoluteFill style={{ background: palette.saffron, ...type }}>
      <Brand />
      <Entrance>
        <h1
          style={{
            position: 'absolute',
            left: 82,
            top: 270,
            fontWeight: 550,
            fontSize: 132,
            lineHeight: 1.02,
            letterSpacing: '-.04em',
            margin: 0,
          }}
        >
          Make it right.
          <br />
          Make it verifiable.
        </h1>
        <p
          style={{
            position: 'absolute',
            left: 88,
            top: 644,
            fontSize: 40,
            maxWidth: 1000,
            lineHeight: 1.4,
          }}
        >
          A payment problem shouldn’t
          <br />
          become a trust problem.
        </p>
      </Entrance>
      <div style={{ position: 'absolute', left: 88, bottom: 65, fontSize: 23 }}>
        Local application preview — no funds transferred. Mainnet proof pending.
      </div>
    </AbsoluteFill>
  );
}
function ProductShot({
  title,
  body,
  image,
  caption,
}: {
  title: string;
  body: string;
  image: string;
  caption: string;
}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: palette.ground, ...type }}>
      <Brand />
      <Entrance>
        <div style={{ position: 'absolute', left: 88, top: 255, width: 495 }}>
          <h2
            style={{
              fontSize: 77,
              lineHeight: 1.08,
              fontWeight: 550,
              letterSpacing: '-.035em',
              margin: '0 0 36px',
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: 31, lineHeight: 1.5, margin: 0 }}>{body}</p>
          <p style={{ fontSize: 22, lineHeight: 1.5, marginTop: 45, color: palette.muted }}>
            {caption}
          </p>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 670,
            top: 186,
            width: 1160,
            height: 736,
            overflow: 'hidden',
            borderRadius: 16,
            boxShadow: '0 22px 65px #2e1c361b',
          }}
        >
          <Img
            src={staticFile(image)}
            style={{
              width: 1160,
              height: 'auto',
              transform: `translateY(${interpolate(frame, [0, 270], [0, -40], { extrapolateRight: 'clamp' })}px)`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </Entrance>
      <Footnote />
    </AbsoluteFill>
  );
}
function Model() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background: palette.plum, color: palette.white, fontFamily: type.fontFamily }}
    >
      <Brand light />
      <h2
        style={{
          position: 'absolute',
          left: 88,
          top: 214,
          fontSize: 85,
          lineHeight: 1.1,
          letterSpacing: '-.035em',
          fontWeight: 550,
          margin: 0,
        }}
      >
        A decision is not a transfer.
      </h2>
      <p style={{ position: 'absolute', left: 88, top: 345, fontSize: 35, color: palette.ground }}>
        The workflow model keeps every boundary visible.
      </p>
      <div
        style={{
          position: 'absolute',
          left: 88,
          right: 88,
          top: 505,
          display: 'grid',
          gridTemplateColumns: 'repeat(5,1fr)',
          gap: 30,
        }}
      >
        {['Requested', 'Approved', 'Wallet signed', 'Observed', 'Confirmed'].map((text, i) => (
          <div
            key={text}
            style={{
              opacity: interpolate(frame, [i * 12, i * 12 + 18], [0.25, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div style={{ height: 3, background: palette.saffron, marginBottom: 28 }} />
            <span style={{ fontSize: 31, lineHeight: 1.3 }}>{text}</span>
          </div>
        ))}
      </div>
      <p
        style={{
          position: 'absolute',
          left: 88,
          bottom: 170,
          fontSize: 30,
          maxWidth: 1400,
          lineHeight: 1.45,
        }}
      >
        The application reserves the refund budget.
        <br />
        Only the merchant’s wallet can authorize a new BCH transaction.
      </p>
      <div
        style={{ position: 'absolute', left: 88, bottom: 52, fontSize: 22, color: palette.ground }}
      >
        Explanation of the implemented workflow — no transaction execution shown
      </div>
    </AbsoluteFill>
  );
}
function Gate() {
  return (
    <AbsoluteFill style={{ background: palette.ground, ...type }}>
      <Brand />
      <Entrance>
        <h2
          style={{
            position: 'absolute',
            left: 88,
            top: 230,
            fontSize: 96,
            lineHeight: 1.08,
            fontWeight: 550,
            letterSpacing: '-.035em',
            margin: 0,
          }}
        >
          Built to resolve.
          <br />
          Ready for the human test.
        </h2>
        <div style={{ position: 'absolute', left: 94, top: 537, fontSize: 34, lineHeight: 1.7 }}>
          <div>Connect and verify actual wallets.</div>
          <div>Authorize a small mainnet payment and refund.</div>
          <div>Publish the real chain evidence.</div>
        </div>
        <div style={{ position: 'absolute', left: 88, bottom: 132, fontSize: 30, fontWeight: 650 }}>
          github.com/sopskistar/returntail
        </div>
      </Entrance>
      <Footnote />
    </AbsoluteFill>
  );
}
export function Preview() {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence name="Problem and identity" from={0} durationInFrames={7 * fps}>
        <Opening />
      </Sequence>
      <Sequence
        name="Genuine merchant workspace capture"
        from={7 * fps}
        durationInFrames={10 * fps}
      >
        <ProductShot
          title="One place to make it right."
          body="Create a payment request. Keep the purchase and any refund connected."
          image="workspace.png"
          caption="Actual localhost interface; isolated QA account."
        />
      </Sequence>
      <Sequence name="Genuine purchase capture" from={17 * fps} durationInFrames={10 * fps}>
        <ProductShot
          title="A purchase with a clear trail."
          body="Recipient, network and exact amount stay visible before payment."
          image="purchase.png"
          caption="Isolated QA order. Awaiting payment; no BCH sent."
        />
      </Sequence>
      <Sequence name="State boundaries explained" from={27 * fps} durationInFrames={10 * fps}>
        <Model />
      </Sequence>
      <Sequence name="Honest verification gates" from={37 * fps} durationInFrames={8 * fps}>
        <Gate />
      </Sequence>
    </AbsoluteFill>
  );
}
