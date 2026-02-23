import React, { useEffect, useState } from 'react';

interface SlideContent {
  headerTitle?: string;
  title?: string;
  subtitle?: string;
  subtitleBox?: boolean;
  body?: string;
  footer?: string;
  position: 'center' | 'center-left' | 'center-right' | 'bottom-left' | 'bottom-right';
  dim?: boolean;
  type?: 'default' | 'columns' | 'blocks' | 'list' | 'funnel' | 'stats' | 'contact' | 'video' | 'ask';

  askAmount?: string;
  askBullets?: { title: string; body: string }[];

  funnelSteps?: string[];
  videoEmbed?: string;
  videoUrl?: string;

  columns?: {
    title?: string;
    subtitle?: string;
    body?: string;
    image?: string;
    bullets?: string[];
  }[];

  blocks?: {
    title?: string;
    body?: string;
  }[];

  listItems?: string[];
  listTitle?: string;

  stats?: { value: string; label: string }[];

  contactInfo?: {
    name: string;
    role: string;
    email: string;
    phone: string;
  }[];

  cta?: {
    text: string;
    url: string;
  };
  emailCta?: {
    text: string;
    email: string;
  };
}

const SLIDE_CONTENT: SlideContent[] = [
  // Slide 0: Cover
  {
    title: 'Menius',
    subtitle: 'Closing the gap between what AI can do and how it\'s used.',
    footer: 'Finn Jennen & Lucas Fedronic — menius.space',
    position: 'center',
    type: 'default',
  },
  // Slide 1: The Founders
  {
    headerTitle: 'Founders',
    type: 'columns',
    position: 'center',
    columns: [
      {
        title: 'Finn Jennen, CEO',
        image: 'images/finn.jpg',
        bullets: [
          '18 years old',
          'From ages 13-16 sold 20,000+ Belgian waffles doing $45K in sales.',
          'Moved solo to Bali to build then made the jump to SF when the room wasn\'t right.',
          'In three weeks shipped product, found co-founder, got first customers.',
          'AI power user, obsessed with education, user experience, data driven decisions, speed and revenue.'
        ]
      },
      {
        title: 'Lucas Fedronic, CTO',
        image: 'images/lucas.jpg',
        bullets: [
          '20 years old',
          'Software engineer intern at Walmart Global Tech',
          'Top-9 finalist at Berkeley AI Hackathon, 350+ teams',
          'Built agentic systems processing 1,600+ applicants at Transpose VC',
          'UC Davis, CS + Mathematics',
          'AI power user, obsessed with agents, tracking data and speed.'
        ]
      }
    ],
    footer: 'Met in a pizza line at a hackathon. Have built togheter a multitude of times.'
  },
  // Slide 2: The Problem
  {
    headerTitle: 'The Problem',
    subtitle: 'The gap between AI\'s capabilities and how the average person uses it is massive and widening. Knowledge workers are handed unprecedented leverage but lack the context to use it. The result is growing anxiety and millions of hours of unrealized productivity.',
    subtitleBox: true,
    type: 'columns',
    position: 'center',
    columns: [
      {
        title: 'Average User',
        bullets: [
          'Treats AI like a search engine.',
          'Types a basic question.',
          'Gets a generic answer.',
          'Copy-pastes.'
        ],
        body: 'Result: Saves 10 minutes (at the cost of cognitive decline).'
      },
      {
        title: 'Power User',
        bullets: [
          'Knows what tools to use, when and why.',
          'Uses AI both for productivity and creativity.',
          'Orchestrates agents that think, iterate, and execute autonomously.'
        ],
        body: 'Result: Becomes a high-leverage generalist and a relentless problem solver.'
      }
    ],
    footer: 'Most people are stuck in the \'Chatbot Era\' while the technology has moved to the \'Agent Era\'.'
  },
  // Slide 3: The Insight
  {
    headerTitle: 'Insight',
    subtitle: 'We did 70+ user interviews and asked over 1,000 people for feedback. We realize that...',
    type: 'blocks',
    position: 'center', // Changed to center to better fit blocks
    blocks: [
      {
        title: 'The Anxiety Cycle',
        body: 'The fear of falling behind is real, but because the path to "learning AI" is so broken, people default to one of three losing states:\n\nThe 1%: Become power users through manual, obsessive trial and error.\n\nThe Majority: Buy a course or watch YouTube, realize it\'s not learnable in these formats, and give up.\n\nThe Rest: Don\'t learn it at all or actively rebel against it.'
      },
      {
        title: 'Every existing solution starts too broad.',
        body: 'Coursera, LinkedIn Learning, NotebookLM try to teach everything and hope to teach it well. We start with one skill, AI literacy, dial it in completely, then reverse engineer it to adjacent skills. Depth compounds. Breadth doesn\'t.'
      },
      {
        title: 'Static Content is Obsolete',
        body: 'By the time you finish a Coursera course, it’s already outdated. You can’t learn a meta-skill like AI by watching a video; you learn it by using it. Each individual only needs the tools and use cases relevant to their work. People need to see immediate benefit to their life, or they check out.'
      },
      {
        title: 'You don’t know what you don’t know.',
        body: 'Many people (especially those over 35) have never played with these tools. They have no idea what is possible, so they don’t realize how far behind they actually are. That gives us a unique opportunity to provide that "wow" moment and show how big the gap is between them and AI literacy is, then let them bridge it with our product.'
      }
    ]
  },
  // Slide 4: The Solution
  {
    headerTitle: 'Solution',
    type: 'list',
    position: 'center',
    listItems: [
      'Menius is an agent/tutor that lives in your browser',
      'Figures out your workflow and your role',
      'Finds the AI tools that actually matter for your job',
      'Teaches you those tools inside the tools themselves'
    ],
  },
  // Slide 5: Solution - Video
  {
    headerTitle: 'Solution',
    type: 'video',
    position: 'center',
    videoEmbed: 'https://www.youtube.com/embed/s6-YgvXSVZM',
  },
  // Slide 6: Strategy - The Funnel
  {
    headerTitle: 'Strategy',
    subtitle: 'We take a data-driven approach using a watertight funnel to track everything from distribution to users buying and using our product.',
    subtitleBox: true,
    type: 'funnel',
    position: 'center',
    funnelSteps: [
      'Testing 8 distribution channels',
      'Website & Onboarding',
      'Hard Paywall',
      'Product + User Interviews'
    ],
  },
  // Slide 6: Strategy - The Two Signals
  {
    headerTitle: 'Strategy',
    subtitle: 'We take a data-driven approach using a watertight funnel to track everything from distribution to users buying and using our product.',
    subtitleBox: true,
    type: 'columns',
    position: 'center',
    columns: [
      {
        title: 'Pre-paywall',
        subtitle: 'Distribution',
        body: 'Everything before the paywall feeds distribution and conversion. This data identifies which channels work and which don\'t. We optimize the onboarding for conversion by running A/B tests exactly where the biggest drop-offs are.'
      },
      {
        title: 'Post-paywall',
        subtitle: 'Product',
        body: 'The highest signal data possible: people who paid. We interview every customer. This feedback, and how they interact with the product, directly feeds product development.'
      }
    ],
    footer: 'We make no assumptions. This funnel is made to provide the highest signal data that decides where our energy goes for distribution, framing, and product development.'
  },
  // Slide 7: Traction
  {
    headerTitle: 'Traction',
    type: 'stats',
    position: 'center',
    stats: [
      { value: '80', label: 'active users' },
      { value: '550', label: 'waitlisted' },
      { value: '5', label: 'paying customers' },
      { value: '$255', label: 'revenue' },
      { value: '$100K', label: 'VC offer' }
    ]
  },
  // Slide 8: Business Model
  {
    headerTitle: 'Business Model',
    type: 'list',
    position: 'center-left',
    listItems: [
      'Now: $49 lifetime access while we build retention.',
      'Next: $20/month subscription — consumer and enterprise per-seat. Companies pay per employee.',
      'Long-term: We live inside users\' browsers and workflows. The usage analytics we collect — which tools people use, how they use them, where they get stuck — is data AI companies will pay for. We sell it or build better products from it.'
    ]
  },
  // Slide 10: The Ask
  {
    headerTitle: 'The Ask',
    type: 'ask',
    position: 'center',
    askAmount: "We're raising $400K",
    askBullets: [
      { title: 'Distribution at scale', body: 'Double down on the acquisition channels already converting, turning a working funnel into a repeatable growth engine.' },
      { title: 'Accelerate product development', body: 'We have a backlog of features real paying users are asking for. This gets us to them faster.' },
      { title: 'Expand our AI agent workforce', body: 'Deploy AI agents as internal employees across all aspects of the company so we move faster without bloating headcount.' },
      { title: 'Land our first enterprise deal', body: 'Fund the sales cycles and custom integrations needed to close our first B2B customer and prove the per-seat model.' },
    ],
  },
  // Slide 11: Thank You
  {
    headerTitle: 'Let\'s get in touch\n and close the gap.',
    type: 'contact',
    position: 'center',
    contactInfo: [
      { name: 'Finn Jennen', role: 'CEO', email: 'finn.jennen@gmail.com', phone: '+1 408 663 9895' },
      { name: 'Lucas Fedronic', role: 'CTO', email: 'lucasfedronic@gmail.com', phone: '+1 650 622 7668' }
    ],
    emailCta: {
      text: 'Email Finn',
      email: 'finn.jennen@gmail.com'
    },
    cta: {
      text: 'See the product',
      url: 'https://menius.space?utm_source=investor'
    },
  }
];

const FadeIn = ({ show, delay, children, style = {} }: { show: boolean; delay: number; children: React.ReactNode, style?: React.CSSProperties }) => (
  <div style={{
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
    ...style
  }}>
    {children}
  </div>
);

export type TransitionState = 'idle' | 'exiting' | 'moving';

export function TextOverlay({ currentSlide, transitionState, transitionData, justFinishedIntro }: { currentSlide: number; transitionState: TransitionState; transitionData?: { from: number; to: number } | null; justFinishedIntro?: boolean }) {
  const visible = transitionState === 'idle';
  const content = SLIDE_CONTENT[currentSlide];
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  // Reset scroll position when slide changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentSlide]);

  if (!content) return null;

  // Determine if header should stay visible
  let showHeader = visible;
  if (transitionData && content.headerTitle) {
    const fromTitle = SLIDE_CONTENT[transitionData.from]?.headerTitle;
    const toTitle = SLIDE_CONTENT[transitionData.to]?.headerTitle;
    if (fromTitle === toTitle && fromTitle === content.headerTitle) {
      showHeader = true;
    }
  }

  // Determine if title should stay visible (for Strategy slide continuity)
  let showTitle = visible;
  if (transitionData && content.title) {
    const fromTitle = SLIDE_CONTENT[transitionData.from]?.title;
    const toTitle = SLIDE_CONTENT[transitionData.to]?.title;
    if (fromTitle === toTitle && fromTitle === content.title) {
      showTitle = true;
    }
  }

  // Determine if subtitle should stay visible (for Strategy slide continuity)
  let showSubtitle = visible;
  if (transitionData && content.subtitle) {
    const fromSubtitle = SLIDE_CONTENT[transitionData.from]?.subtitle;
    const toSubtitle = SLIDE_CONTENT[transitionData.to]?.subtitle;
    const fromSubtitleBox = SLIDE_CONTENT[transitionData.from]?.subtitleBox;
    const toSubtitleBox = SLIDE_CONTENT[transitionData.to]?.subtitleBox;
    if (fromSubtitle === toSubtitle && fromSubtitle === content.subtitle && fromSubtitleBox === toSubtitleBox) {
      showSubtitle = true;
    }
  }

  // Determine if footer should stay visible (for Strategy slide continuity)
  let showFooter = visible;
  if (transitionData && content.footer) {
    const fromFooter = SLIDE_CONTENT[transitionData.from]?.footer;
    const toFooter = SLIDE_CONTENT[transitionData.to]?.footer;
    if (fromFooter === toFooter && fromFooter === content.footer) {
      showFooter = true;
    }
  }

  const isCenter = content.position === 'center';
  const isLeft = content.position.includes('left');
  const isBottom = content.position.includes('bottom');
  const isTitleSlide = currentSlide === 0;
  const isBrightSlide = [6, 8].includes(currentSlide);
  const isIntroSkip = justFinishedIntro && isTitleSlide;

  // Base delay for stagger
  let delayCounter = 0;
  const getDelay = () => {
    const d = delayCounter;
    delayCounter += 300;
    return d;
  };

  return (
    <div
      ref={containerRef}
      className="text-overlay-root"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: 'max(40px, 4vw)',
        paddingTop: 'max(40px, env(safe-area-inset-top) + 20px)',
        paddingBottom: 'max(40px, env(safe-area-inset-bottom) + 20px)',
        pointerEvents: 'auto',
        zIndex: 10,
        textAlign: isCenter ? 'center' : isLeft ? 'left' : 'right',
        color: '#fff',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {/* Header Title (Top of Page) */}
      {content.headerTitle && (
        <div style={{
          flex: '0 0 auto',
          marginBottom: 20,
          textAlign: 'center',
          zIndex: 20
        }}>
          <FadeIn show={showHeader} delay={0}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'min(64px, 10vw)',
              fontWeight: 600,
              fontStyle: 'italic',
              margin: 0,
              color: '#fff',
              textShadow: '0 0 40px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)',
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
            }}>
              {content.headerTitle}
            </h2>
          </FadeIn>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        marginTop: isBottom ? 'auto' : 'auto',
        marginBottom: isBottom ? 0 : 'auto',
        alignItems: isCenter ? 'center' : isLeft ? 'flex-start' : 'flex-end',
        justifyContent: isBottom ? 'flex-end' : 'center',
        width: '100%',
        textAlign: isCenter ? 'center' : 'inherit' // Ensure text is centered if position is center
      }}>
        {/* Title */}
        {content.title && (
          <FadeIn show={showTitle} delay={isIntroSkip ? 0 : getDelay()} style={isIntroSkip ? { opacity: 1, transform: 'none', transition: 'none' } : undefined}>
            <h1 style={{
              fontFamily: isTitleSlide ? "'Playfair Display', serif" : "'Plus Jakarta Sans', sans-serif",
              fontSize: isTitleSlide ? 'min(180px, 20vw)' : 'min(52px, 8vw)',
              fontWeight: isTitleSlide ? 600 : 700,
              fontStyle: isTitleSlide ? 'italic' : 'normal',
              color: '#fff',
              textShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.8)',
              marginBottom: isTitleSlide ? 24 : 32,
              letterSpacing: isTitleSlide ? '-0.02em' : '-0.03em',
              lineHeight: 1.1,
              maxWidth: isTitleSlide ? 1000 : 900,
              whiteSpace: 'pre-line', // Allow newlines in title
              marginLeft: 'auto', // Auto margins for true centering
              marginRight: 'auto', // Auto margins for true centering
              textAlign: 'center', // Explicitly center text content
            }}>
              {content.title}
            </h1>
          </FadeIn>
        )}

        {/* Subtitle */}
        {content.subtitle && (
          <FadeIn 
            key={`subtitle-${currentSlide}`}
            show={showSubtitle} 
            delay={isIntroSkip ? 0 : (content.subtitleBox ? 0 : getDelay())} 
            style={isIntroSkip ? { opacity: 1, transform: 'none', transition: 'none' } : (content.subtitleBox ? {
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              padding: 'clamp(20px, 4vw, 32px) clamp(24px, 5vw, 40px)',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.08)',
              maxWidth: 1000,
              width: '100%',
              marginBottom: 32,
            } : undefined)}
          >
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: isTitleSlide ? 'min(24px, 5.5vw)' : 'min(24px, 5vw)',
              fontWeight: isTitleSlide ? 500 : 400,
              color: isTitleSlide ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)',
              textShadow: '0 0 40px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)',
              lineHeight: isTitleSlide ? 1.4 : 1.6,
              letterSpacing: isTitleSlide ? '-0.01em' : '-0.01em',
              whiteSpace: 'pre-line',
              maxWidth: content.subtitleBox ? '100%' : (isTitleSlide ? 800 : 700),
              marginBottom: content.subtitleBox ? 0 : (isTitleSlide ? 0 : 32),
              margin: 0,
              paddingRight: isTitleSlide ? 'min(60px, 10vw)' : 0, // Avoid overlap with nav dots on mobile
              paddingLeft: isTitleSlide ? 'min(60px, 10vw)' : 0, // Symmetric padding
              marginLeft: 'auto', // Auto margins for true centering
              marginRight: 'auto', // Auto margins for true centering
              textAlign: 'center', // Explicitly center text content
            }}>
              {content.subtitle}
            </p>
          </FadeIn>
        )}

        {/* Columns */}
        {content.type === 'columns' && content.columns && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(24px, 4vw, 60px)',
            marginTop: 20,
            maxWidth: 1200,
            width: '100%',
            justifyContent: 'center'
          }}>
            {content.columns.map((col, i) => (
              <FadeIn key={i} show={visible} delay={getDelay()} style={{
                flex: '1 1 min(300px, 100%)',
                background: isBrightSlide ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                padding: 'clamp(24px, 3vw, 40px)',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                textAlign: 'left' // Force left alignment
              }}>
                {/* Image & Title Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  paddingBottom: 24,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {col.image && (
                    <img
                      src={col.image}
                      alt={col.title}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                      }}
                    />
                  )}
                  {col.title && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h3 style={{
                        fontSize: 'min(28px, 6vw)',
                        fontWeight: 600,
                        fontFamily: "'Playfair Display', serif",
                        margin: 0,
                        letterSpacing: '-0.01em'
                      }}>
                        {col.title.split(',')[0]}
                      </h3>
                      <span style={{
                        fontSize: 'min(16px, 4vw)',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                        {col.subtitle || col.title.split(',')[1]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bullet Points */}
                {col.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                    {col.bullets.map((bullet, bIndex) => (
                      <li key={bIndex} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <span style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 14,
                          marginTop: 5,
                          flexShrink: 0
                        }}>●</span>
                        <span style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          color: 'rgba(255,255,255,0.85)',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 400
                        }}>
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Body Text */}
                {col.body && <p style={{ fontSize: 'min(18px, 4.5vw)', lineHeight: 1.6, whiteSpace: 'pre-line', color: 'rgba(255,255,255,0.9)', marginTop: 24, fontStyle: 'italic' }}>{col.body}</p>}
              </FadeIn>
            ))}
          </div>
        )}

        {/* Blocks */}
        {content.type === 'blocks' && content.blocks && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20, maxWidth: 800 }}>
            {content.blocks.map((block, i) => (
              <FadeIn key={i} show={visible} delay={getDelay()} style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: 24, borderRadius: 12, borderLeft: '4px solid rgba(255,255,255,0.3)' }}>
                {block.title && <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{block.title}</h3>}
                {block.body && <p style={{ fontSize: 16, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{block.body}</p>}
              </FadeIn>
            ))}
          </div>
        )}

        {/* List */}
        {content.type === 'list' && content.listItems && (
          <FadeIn show={visible} delay={getDelay()} style={{
            marginTop: 20,
            maxWidth: 900,
            background: isBrightSlide ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 32,
            padding: 'clamp(24px, 5vw, 48px)',
            boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {content.listItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', marginTop: 10, flexShrink: 0 }} />
                <p style={{ fontSize: 'min(24px, 5vw)', lineHeight: 1.5, color: 'rgba(255,255,255,0.95)', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontStyle: 'italic' }}>{item}</p>
              </div>
            ))}
          </FadeIn>
        )}

        {/* Funnel Visual */}
        {content.type === 'funnel' && content.funnelSteps && (
          <FadeIn show={visible} delay={getDelay()} style={{
            marginTop: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0, // No gap, stacked
            width: '100%',
            maxWidth: 800
          }}>
            {content.funnelSteps.map((step, i) => {
              const widthPercentage = 100 - (i * 20); // 100%, 80%, 60%, 40%

              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                        <path d="M12 14L2 4L4.8 1.2L12 8.4L19.2 1.2L22 4L12 14Z" fill="rgba(255,255,255,0.4)" />
                      </svg>
                    </div>
                  )}
                  <div className="funnel-block" style={{
                    width: `${widthPercentage}%`,
                    minWidth: 'min(320px, 100%)',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: content.funnelSteps!.length - i,
                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                  }}>
                    <span style={{
                      fontSize: 'min(22px, 5vw)',
                      fontWeight: 500,
                      color: '#fff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: '-0.01em',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {step}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </FadeIn>
        )}


        {/* Default Body */}
        {content.body && content.type !== 'columns' && content.type !== 'blocks' && (
          <FadeIn show={visible} delay={getDelay()}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20,
              fontWeight: 400,
              color: content.dim ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
              textShadow: '0 0 40px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              maxWidth: 650,
              marginTop: 20,
            }}>
              {content.body}
            </p>
          </FadeIn>
        )}

        {/* Stats */}
        {content.stats && (
          <div className="stats-container" style={{ marginTop: 24, maxWidth: 1000, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <FadeIn show={visible} delay={getDelay()} style={{
              display: 'flex',
              gap: 64,
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              background: isBrightSlide ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 32,
              padding: '48px',
              boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.2)',
            }}>
              {content.stats.map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'min(52px, 12vw)',
                    fontWeight: 800,
                    color: '#fff',
                    textShadow: '0 0 40px rgba(100,180,255,0.4), 0 0 80px rgba(100,180,255,0.2)',
                    lineHeight: 1.2,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginTop: 4,
                    maxWidth: 150,
                    margin: '4px auto 0'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </FadeIn>
          </div>
        )}

        {/* Contact Info */}
        {content.contactInfo && (
          <div className="contact-grid" style={{ display: 'flex', gap: 80, marginTop: 40, justifyContent: 'center' }}>
            {content.contactInfo.map((contact, i) => (
              <FadeIn key={i} show={visible} delay={getDelay()} style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 'min(28px, 7vw)', fontWeight: 700 }}>{contact.name}</h3>
                <p style={{ fontSize: 'min(18px, 4.5vw)', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{contact.role}</p>
                <p style={{ fontSize: 16, userSelect: 'text', cursor: 'text' }}>{contact.email}</p>
                <p style={{ fontSize: 16, userSelect: 'text', cursor: 'text' }}>{contact.phone}</p>
              </FadeIn>
            ))}
          </div>
        )}

        {/* Video Embed */}
        {content.type === 'video' && content.videoEmbed && (
          <FadeIn show={visible} delay={getDelay()} style={{
            marginTop: 20,
            width: '100%',
            maxWidth: 900,
            aspectRatio: '16/9',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <iframe
              width="100%"
              height="100%"
              src={content.videoEmbed}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ display: 'block' }}
            />
          </FadeIn>
        )}

        {/* Ask */}
        {content.type === 'ask' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, width: '100%', marginTop: 20 }}>
            {/* Widget 1: Raise amount */}
            <FadeIn show={visible} delay={getDelay()} style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 32,
              padding: 'clamp(28px, 5vw, 52px) clamp(24px, 5vw, 48px)',
              boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'min(52px, 9vw)',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '-0.02em',
                textShadow: '0 0 60px rgba(0,0,0,0.6)',
              }}>
                {content.askAmount}
              </p>
            </FadeIn>
            {/* Widget 2: Use of funds */}
            <FadeIn show={visible} delay={getDelay()} style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 32,
              padding: 'clamp(24px, 5vw, 48px)',
              boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textAlign: 'left',
            }}>
              {content.askBullets?.map((bullet, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', marginTop: 9, flexShrink: 0 }} />
                  <p style={{
                    fontSize: 'min(18px, 4.5vw)',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.92)',
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 400,
                  }}>
                    <strong style={{ color: '#fff', fontWeight: 600 }}>{bullet.title}</strong>
                    {' — '}
                    {bullet.body}
                  </p>
                </div>
              ))}
            </FadeIn>
          </div>
        )}

        {/* Email CTA */}
        {content.emailCta && (
          <FadeIn show={visible} delay={getDelay()}>
            <div style={{ marginTop: 80, pointerEvents: 'auto' }}>
              <a
                href={`mailto:${content.emailCta.email}`}
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 30,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                {content.emailCta.text} →
              </a>
            </div>
          </FadeIn>
        )}

        {/* CTA */}
        {content.cta && (
          <FadeIn show={visible} delay={getDelay()}>
            <div style={{ marginTop: content.emailCta ? 20 : 80, pointerEvents: 'auto' }}>
              <a
                href={content.cta.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 30,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                {content.cta.text} →
              </a>
            </div>

            {/* Also Download PDF Button - only for contact slide */}
            {content.type === 'contact' && (
              <div style={{ marginTop: 24, pointerEvents: 'auto' }}>
                <a
                  href="/pitch/Menius_Pitch_Deck.pdf"
                  download="Menius_Pitch_Deck.pdf"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 30,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  Also download as PDF again
                </a>
              </div>
            )}
          </FadeIn>
        )}
      </div>

      {/* Footer */}
      {content.footer && (
        <FadeIn show={showFooter} delay={getDelay()} style={{
          position: isTitleSlide ? 'absolute' : 'relative',
          bottom: isTitleSlide ? 100 : 'auto',
          left: 0, // Ensure it's centered relative to the screen, not the padded container
          marginTop: isTitleSlide ? 0 : 60,
          opacity: 0.9,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none' // Let clicks pass through
        }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            maxWidth: 800,
            textAlign: 'center',
            lineHeight: 1.6,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            background: isBrightSlide ? 'rgba(0,0,0,0.15)' : 'transparent', // Lighter backing
            padding: isBrightSlide ? '12px 24px' : 0,
            borderRadius: 12,
            backdropFilter: isBrightSlide ? 'blur(10px)' : 'none',
          }}>
            {content.footer}
          </p>
        </FadeIn>
      )}
      {/* Navigation Hint */}
      {isTitleSlide && (
        <FadeIn show={visible} delay={500} style={{
          position: 'absolute',
          bottom: isTouchDevice ? 'max(40px, env(safe-area-inset-bottom) + 40px)' : 30,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          {!isTouchDevice ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(0,0,0,0.6)',
              padding: '12px 24px',
              borderRadius: 99,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <span style={{
                fontSize: 16,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 500,
                letterSpacing: '0.02em'
              }}>
                Use arrows to go back and forth
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <kbd style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>←</kbd>
                <kbd style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>→</kbd>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              opacity: 0.9
            }}>
              <style>{`
                @keyframes pulsePop {
                  0% { transform: scale(1); opacity: 0.8; }
                  50% { transform: scale(1.05); opacity: 1; text-shadow: 0 0 15px rgba(255,255,255,0.6); }
                  100% { transform: scale(1); opacity: 0.8; }
                }
              `}</style>

              <span style={{
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                textAlign: 'center',
                animation: 'pulsePop 2s infinite ease-in-out'
              }}>
                Scroll up with your finger
              </span>
            </div>
          )}
        </FadeIn>
      )}

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .text-overlay-root {
            padding: max(16px, 3vw) !important;
          }
          .cover-title {
            font-size: min(72px, 18vw) !important;
          }
          .stats-container > div {
            gap: 24px !important;
            padding: 24px !important;
          }
          .stats-container > div > div > div:first-child {
            font-size: 36px !important;
          }
          .contact-grid {
            gap: 32px !important;
            flex-direction: column !important;
          }
          .funnel-block {
            min-width: min(320px, 85vw) !important;
          }
        }
      `}</style>

    </div>
  );
}