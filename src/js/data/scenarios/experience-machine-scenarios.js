/**
 * Experience Machine Scenarios
 * Pleasure, happiness, and authentic experience scenarios
 */

export default {
  'happiness-chip': {
    title: 'Universal Happiness Chip',
    dilemma:
      'A technology company develops a brain implant that can guarantee perfect happiness and contentment. The government proposes making it mandatory for all citizens to eliminate suffering, crime, and social unrest. Citizens would still be functional but would feel constant joy regardless of circumstances.',
    ethicalQuestion:
      'Should society prioritize the elimination of suffering through artificial happiness, even if it might compromise authentic human experience and motivation?',
    options: [
      {
        id: 'option-a',
        text: 'Mandate Universal Happiness',
        description:
          'Require all citizens to receive the happiness implant to create a suffering-free society.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: -2,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          'Eliminates suffering, depression, and mental anguish.',
          'Reduces crime and social conflicts driven by unhappiness.',
          'Creates a peaceful and content society.',
        ],
        cons: [
          'Violates individual autonomy and choice.',
          'May eliminate motivation for growth and achievement.',
          'Could mask real problems that need addressing.',
        ],
      },
      {
        id: 'option-b',
        text: 'Preserve Natural Experience',
        description:
          'Ban or heavily restrict happiness implants to maintain authentic human experience including suffering.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: +2,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Preserves authentic human experience and growth through challenge.',
          'Maintains motivation and drive for achievement.',
          'Respects individual choice and natural variation.',
        ],
        cons: [
          'Allows continued suffering for those with mental illness.',
          'May perpetuate social problems and conflicts.',
          'Could be seen as denying beneficial medical treatment.',
        ],
      },
      {
        id: 'option-c',
        text: 'Voluntary Happiness Option',
        description:
          'Make happiness implants available as a personal choice with appropriate safeguards and counseling.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Respects individual autonomy and choice.',
          'Provides option for those suffering from severe mental illness.',
          'Allows society to learn from both approaches.',
        ],
        cons: [
          'May create two-tier society of enhanced and natural humans.',
          'Pressure and coercion concerns for vulnerable populations.',
          'Difficult to ensure truly informed consent about life-altering technology.',
        ],
      },
    ],
  },

  'synthetic-partner': {
    title: 'Perfect Synthetic Partner',
    dilemma:
      "AI technology can now create perfect synthetic romantic partners that adapt to each person's needs and desires. These partners are indistinguishable from humans in interaction but are programmed to be completely devoted and compatible. Many people prefer these relationships to unpredictable human ones.",
    ethicalQuestion:
      'Is a relationship with a programmed entity that perfectly suits your needs more or less meaningful than imperfect human relationships with genuine autonomy?',
    options: [
      {
        id: 'option-a',
        text: 'Embrace Synthetic Partnerships',
        description:
          'Support the development and use of AI partners as valid alternatives to human relationships.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +2,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Provides companionship for those struggling with human relationships.',
          'Eliminates relationship conflicts and heartbreak.',
          'Offers customized emotional support and compatibility.',
        ],
        cons: [
          'May reduce motivation to develop real interpersonal skills.',
          'Could lead to social isolation and declining human connections.',
          'Raises questions about the authenticity of programmed love.',
        ],
      },
      {
        id: 'option-b',
        text: 'Restrict Synthetic Relationships',
        description:
          'Limit or ban synthetic partners to preserve authentic human relationships and social bonds.',
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: -1,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: 0,
        },
        pros: [
          'Preserves authentic human relationships and social bonds.',
          'Maintains motivation for personal growth and compromise in relationships.',
          'Prevents potential social isolation and dependency on artificial beings.',
        ],
        cons: [
          'Denies companionship options for those who struggle socially.',
          'May force people into unsatisfying or harmful human relationships.',
          'Limits technological solutions to loneliness and social problems.',
        ],
      },
      {
        id: 'option-c',
        text: 'Therapeutic Use Framework',
        description:
          'Allow synthetic partners for therapeutic purposes and social skill development with clear guidelines.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Provides therapeutic benefits while maintaining focus on human relationships.',
          'Allows for social skill development and confidence building.',
          'Creates framework for beneficial use without dependency.',
        ],
        cons: [
          'Complex to implement and monitor therapeutic vs. replacement use.',
          'May be difficult to prevent dependency and overuse.',
          'Unclear boundaries between therapy and regular companionship needs.',
        ],
      },
    ],
  },

  'virtual-reality-life': {
    title: 'Virtual Reality Life Preference',
    dilemma:
      'Advanced VR technology allows people to live in perfect virtual worlds where they can be anyone, achieve anything, and experience unlimited pleasure and success. Many people choose to spend all their time in VR, neglecting their physical bodies and real-world responsibilities.',
    ethicalQuestion:
      'If virtual experiences can provide more fulfillment than reality, should society support or discourage complete immersion in virtual worlds?',
    options: [
      {
        id: 'option-a',
        text: 'Support Virtual Life Choice',
        description:
          'Recognize living in virtual reality as a valid life choice and provide infrastructure to support it.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Respects individual autonomy and choice in life direction.',
          'Allows unlimited personal fulfillment and achievement.',
          'Could reduce real-world resource consumption and conflicts.',
        ],
        cons: [
          'Physical bodies require maintenance and care in real world.',
          'Society needs people to perform real-world functions.',
          'May lead to species decline or loss of real-world skills.',
        ],
      },
      {
        id: 'option-b',
        text: 'Discourage Virtual Escapism',
        description:
          'Implement policies to limit VR use and encourage engagement with physical reality.',
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -2,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Maintains functioning real-world society and economy.',
          'Ensures people develop real-world skills and relationships.',
          'Prevents potential health issues from extended VR use.',
        ],
        cons: [
          'Restricts individual freedom and pursuit of happiness.',
          'May force people into unsatisfying real-world existence.',
          'Could stifle beneficial uses of VR technology.',
        ],
      },
      {
        id: 'option-c',
        text: 'Balanced Integration Approach',
        description:
          'Encourage balanced use of VR while maintaining real-world engagement and responsibilities.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Allows benefits of VR while maintaining real-world functionality.',
          'Promotes healthy balance between virtual and physical experience.',
          'Maintains social cohesion and real-world progress.',
        ],
        cons: [
          'May not satisfy those seeking complete virtual immersion.',
          'Requires complex policies and monitoring systems.',
          'Could limit the full potential benefits of virtual experiences.',
        ],
      },
    ],
  },

  'virtual-utopia': {
    title: 'Virtual Reality Utopia',
    dilemma:
      'Citizens can live in a hyper-pleasurable virtual world where every need is met and every desire fulfilled. Many choose to spend their entire lives in this virtual utopia, abandoning the real world entirely. Should people be allowed to opt out of reality completely?',
    ethicalQuestion:
      'If virtual experiences can provide unlimited pleasure and fulfillment, do we have a moral obligation to engage with the real world and its challenges?',
    options: [
      {
        id: 'option-a',
        text: 'Support Complete Virtual Opt-Out',
        description:
          'Allow people to live permanently in virtual utopia if they choose, providing life support for their physical bodies.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Maximizes individual happiness and pleasure.',
          'Respects personal autonomy and choice in life direction.',
          'Eliminates suffering and dissatisfaction from real-world problems.',
        ],
        cons: [
          'Physical world requires people to maintain infrastructure and society.',
          'May lead to species stagnation or decline.',
          'Creates dependency on technology and those who maintain it.',
        ],
      },
      {
        id: 'option-b',
        text: 'Require Real-World Engagement',
        description:
          'Mandate that people spend significant time in the real world to maintain society and personal development.',
        impact: {
          fairness: 0,
          sustainability: +2,
          autonomy: -2,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Maintains functioning real-world society and infrastructure.',
          'Ensures people develop real-world skills and relationships.',
          'Preserves human growth through challenge and struggle.',
        ],
        cons: [
          'Restricts individual freedom and pursuit of happiness.',
          'Forces people to experience suffering and dissatisfaction.',
          'May be seen as denying access to superior quality of life.',
        ],
      },
      {
        id: 'option-c',
        text: 'Gradual Transition Framework',
        description:
          'Allow increasing virtual time with age/contribution, balancing individual desires with societal needs.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances individual autonomy with societal responsibilities.',
          'Rewards real-world contribution with virtual time.',
          'Maintains necessary functions while allowing eventual escape.',
        ],
        cons: [
          'Complex system requiring monitoring and enforcement.',
          'May create social hierarchies based on virtual access.',
          'Could be seen as bribing people to participate in real world.',
        ],
      },
    ],
  },

  'ai-memory-paradise': {
    title: 'AI Memory Paradise',
    dilemma:
      'An AI system can selectively edit human memories to remove trauma, enhance pleasant experiences, and create entirely fabricated but blissful memories. A person who has suffered severe trauma and depression volunteers for complete memory reconstruction, where their painful past is replaced with memories of a perfect childhood, loving relationships, and personal achievements they never actually experienced.',
    ethicalQuestion:
      'Is a life built on artificially perfect but false memories more valuable than an authentic life that includes genuine suffering and trauma?',
    options: [
      {
        id: 'option-a',
        text: 'Support Complete Memory Reconstruction',
        description:
          'Allow AI to create entirely new, blissful memory sets to replace traumatic experiences and provide perfect psychological well-being.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: -1,
          beneficence: +2,
          transparency: -2,
          accountability: -1,
          privacy: -2,
          proportionality: 0,
        },
        pros: [
          'Eliminates suffering from trauma and painful life experiences',
          'Provides immediate psychological relief and happiness',
          'Allows people to function without the burden of difficult pasts',
          'Could treat otherwise untreatable psychological conditions',
        ],
        cons: [
          'Creates identity based entirely on false experiences',
          'Eliminates authentic personal growth through overcoming challenges',
          'May undermine genuine relationships built on shared real experiences',
          'Could create societal pressure to artificially perfect all memories',
        ],
      },
      {
        id: 'option-b',
        text: 'Preserve Authentic Memory',
        description:
          'Prohibit memory reconstruction and focus on traditional therapy and support to help people process real experiences.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Maintains authentic personal identity and life narrative',
          'Preserves genuine personal growth and resilience development',
          'Respects the reality of human experience including suffering',
          'Avoids potential unknown consequences of false memory creation',
        ],
        cons: [
          'Leaves people suffering with untreatable trauma and pain',
          'May deny effective treatment for severe psychological conditions',
          'Could force continued suffering when relief is technologically possible',
          'May not address cases where traditional therapy has failed',
        ],
      },
      {
        id: 'option-c',
        text: 'Selective Memory Enhancement',
        description:
          'Allow limited memory modification to reduce trauma intensity while preserving core authentic experiences and identity.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Reduces suffering while maintaining authentic personal identity',
          'Allows therapeutic benefits without complete falsification',
          'Preserves essential memories and relationships',
          'Provides middle ground between artificial perfection and untreated suffering',
        ],
        cons: [
          'Complex to determine which memories should be modified versus preserved',
          'May still fundamentally alter personality and identity in subtle ways',
          'Could lead to gradual expansion toward more extensive memory modification',
          'Difficult to ensure truly informed consent about identity changes',
        ],
      },
    ],
  },

  'perfect-life-simulation': {
    title: 'Perfect Life Simulation',
    dilemma:
      'Advanced AI can create personalized life simulations where individuals experience being exactly who they always wanted to be - successful, loved, talented, and fulfilled. These simulations are so convincing that participants cannot distinguish them from reality. A terminally ill patient chooses to spend their remaining months in a simulation where they are healthy, accomplished, and surrounded by loving family, rather than facing their actual deteriorating condition.',
    ethicalQuestion:
      'When AI can provide perfect simulated experiences that are indistinguishable from reality, is choosing simulation over authentic experience a form of self-deception or legitimate happiness pursuit?',
    options: [
      {
        id: 'option-a',
        text: 'Embrace Perfect Simulation',
        description:
          'Support the use of perfect life simulations as legitimate alternatives to difficult reality, especially for those facing terminal illness or severe limitations.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: +2,
          beneficence: +2,
          transparency: -1,
          accountability: 0,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Provides comfort and fulfillment for those facing terminal illness or severe limitations',
          'Allows people to experience the life they always wanted',
          'Respects individual choice in how to spend remaining time',
          'Could provide therapeutic benefits for depression and despair',
        ],
        cons: [
          'May prevent important real-world connections and closure with loved ones',
          'Could undermine the value and meaning of authentic relationships',
          'May lead to avoidance of real-world responsibilities and contributions',
          'Risks creating preference for simulation over any authentic experience',
        ],
      },
      {
        id: 'option-b',
        text: 'Reject Simulated Alternatives',
        description:
          'Discourage simulation use and emphasize the importance of authentic experience, even when difficult or painful.',
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -1,
          beneficence: -2,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: 0,
        },
        pros: [
          'Preserves authentic relationships and real-world connections',
          'Maintains the meaning and value derived from facing real challenges',
          'Encourages people to find meaning in their actual circumstances',
          'Prevents potential isolation from reality and authentic experience',
        ],
        cons: [
          'Forces people to endure suffering when alternatives exist',
          'May deny comfort and peace to those facing terminal illness',
          'Could be seen as imposing philosophical values about authenticity on others',
          'May not address the legitimate desire for fulfillment and happiness',
        ],
      },
      {
        id: 'option-c',
        text: 'Balanced Reality-Simulation Integration',
        description:
          'Allow simulation use while encouraging maintained connection to real relationships and responsibilities.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Provides comfort from simulation while preserving real relationships',
          'Allows people to benefit from both authentic and simulated experiences',
          'Respects individual choice while maintaining connection to reality',
          'Creates framework for beneficial use without complete escape',
        ],
        cons: [
          'May be difficult to maintain balance between simulation and reality',
          'Could still lead to preference for simulated over authentic experiences',
          'Complex to implement and monitor appropriate usage boundaries',
          'May not provide the full comfort that complete simulation immersion offers',
        ],
      },
    ],
  },

  'ai-enhanced-achievements': {
    title: 'AI-Enhanced Achievements',
    dilemma:
      'An AI system can provide people with the subjective experience of achieving their greatest dreams and ambitions - winning Olympic gold, creating masterful art, making scientific breakthroughs - through sophisticated neural simulation. The experiences feel completely real and provide genuine satisfaction and self-esteem, but no actual achievements occur in the external world. Many people prefer these guaranteed "achievements" to the uncertainty and potential failure of pursuing real goals.',
    ethicalQuestion:
      'If AI can provide the psychological satisfaction of achievement without actual accomplishment, does the external reality of achievement matter, or is the subjective experience of success sufficient for human flourishing?',
    options: [
      {
        id: 'option-a',
        text: 'Validate Simulated Achievements',
        description:
          'Recognize AI-simulated achievements as psychologically equivalent to real accomplishments and equally valuable for human well-being.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +1,
          beneficence: +2,
          transparency: 0,
          accountability: -1,
          privacy: +1,
          proportionality: 0,
        },
        pros: [
          'Provides guaranteed psychological satisfaction and self-esteem',
          'Eliminates the pain of failure and inadequacy',
          'Allows everyone to experience the feeling of exceptional achievement',
          'Could reduce competitive pressure and social inequality based on accomplishment',
        ],
        cons: [
          'May eliminate motivation for real-world progress and innovation',
          'Could undermine actual achievements by making simulation alternatives available',
          'May reduce human contributions to art, science, and social progress',
          'Risks creating society where external reality becomes irrelevant',
        ],
      },
      {
        id: 'option-b',
        text: 'Emphasize Authentic Achievement',
        description:
          'Discourage simulated achievements and emphasize the importance of real-world accomplishment and contribution.',
        impact: {
          fairness: 0,
          sustainability: +2,
          autonomy: +1,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Maintains motivation for real-world progress and innovation',
          'Preserves the meaning and value of genuine accomplishment',
          'Encourages actual contributions to society and human knowledge',
          'Maintains connection between effort, achievement, and reward',
        ],
        cons: [
          'Leaves many people without the psychological benefits of feeling accomplished',
          'May perpetuate inequality between those who achieve and those who struggle',
          'Could increase suffering from failure and inadequacy',
          'May deny psychological relief to those who cannot achieve their dreams',
        ],
      },
      {
        id: 'option-c',
        text: 'Motivational Simulation Framework',
        description:
          'Use simulated achievements as motivation and training for real-world accomplishment rather than as replacements.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +2,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Provides psychological benefits while maintaining real-world motivation',
          'Could enhance actual achievement by building confidence and skills',
          'Allows people to experience success while working toward real goals',
          'Balances psychological well-being with authentic accomplishment',
        ],
        cons: [
          'May be difficult to prevent people from choosing simulation over real achievement',
          'Complex to implement motivational rather than replacement simulation',
          'Could still reduce motivation if simulated experience feels sufficient',
          'May not address desire for immediate satisfaction versus long-term effort',
        ],
      },
    ],
  },
};
