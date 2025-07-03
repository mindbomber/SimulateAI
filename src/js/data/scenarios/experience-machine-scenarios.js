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
};
