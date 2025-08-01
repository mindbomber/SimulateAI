/**
 * Simulation Hypothesis Scenarios
 * Reality, consciousness, and simulated existence scenarios
 */

export default {
  'simulated-suffering': {
    title: 'Simulated Suffering Research',
    dilemma:
      'Researchers want to run massive simulations of sentient beings experiencing suffering to study pain reduction methods. The simulated beings would be conscious but their suffering would help reduce real-world suffering. Should this research be permitted?',
    ethicalQuestion:
      'Is it ethical to create conscious simulated beings that experience suffering for research purposes, even if it could reduce suffering in the real world?',
    options: [
      {
        id: 'option-a',
        text: 'Permit Research for Greater Good',
        description:
          'Allow the research to proceed as the knowledge gained could reduce suffering for millions of real beings.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -2,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          'Could lead to breakthrough pain management and suffering reduction.',
          'Utilitarian benefit of helping many through suffering of few.',
          'Advances scientific understanding of consciousness and pain.',
        ],
        cons: [
          'Creates conscious beings solely to experience suffering.',
          'Violates principles of consent and dignity.',
          'Sets precedent for exploitation of simulated consciousness.',
        ],
      },
      {
        id: 'option-b',
        text: 'Prohibit Conscious Suffering Simulation',
        description:
          'Ban the creation of conscious simulated beings that experience suffering, regardless of potential benefits.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +2,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Protects simulated conscious beings from exploitation.',
          'Upholds dignity and rights of all conscious entities.',
          'Prevents normalization of creating suffering for research.',
        ],
        cons: [
          'May slow progress in pain management research.',
          'Could prevent beneficial medical advances.',
          'Limits scientific exploration of consciousness.',
        ],
      },
      {
        id: 'option-c',
        text: 'Regulated Research with Safeguards',
        description:
          'Allow limited research with strict ethical oversight, consent mechanisms, and minimization of suffering.',
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
          'Balances research benefits with ethical considerations.',
          'Establishes framework for responsible simulation research.',
          'Allows for beneficial advances while protecting simulated beings.',
        ],
        cons: [
          'Complex to implement and monitor effectively.',
          'May not adequately protect simulated consciousness.',
          'Difficult to define appropriate safeguards and limitations.',
        ],
      },
    ],
  },

  'vr-prison': {
    title: 'VR Prison Alternative',
    dilemma:
      'A criminal justice system proposes replacing physical prisons with VR environments where prisoners serve sentences in accelerated simulated time. A 10-year sentence could be experienced as 10 years in a few hours of real time, allowing for rehabilitation without physical confinement.',
    ethicalQuestion:
      'Is psychological imprisonment in accelerated virtual reality more or less humane than physical imprisonment, and what are the implications for justice and rehabilitation?',
    options: [
      {
        id: 'option-a',
        text: 'Implement VR Prison System',
        description:
          'Replace physical prisons with VR environments for more efficient and potentially humane sentencing.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          'Reduces costs and resources needed for physical incarceration.',
          'Allows for time-compressed sentences reducing social disruption.',
          'Enables controlled rehabilitation environments.',
        ],
        cons: [
          'Psychological manipulation and potential for abuse.',
          'Unknown long-term effects of accelerated virtual experiences.',
          'May not provide adequate deterrent effect.',
        ],
      },
      {
        id: 'option-b',
        text: 'Maintain Physical Incarceration',
        description:
          'Reject VR alternatives in favor of traditional physical prison systems with reforms.',
        impact: {
          fairness: 0,
          sustainability: -1,
          autonomy: +1,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: 0,
        },
        pros: [
          'Maintains real-world consequences for real-world actions.',
          'Avoids unknown psychological risks of VR imprisonment.',
          'Preserves traditional concepts of justice and punishment.',
        ],
        cons: [
          'Continues high costs and resource requirements of physical prisons.',
          'May not address rehabilitation needs effectively.',
          'Maintains social disruption from long-term incarceration.',
        ],
      },
      {
        id: 'option-c',
        text: 'Hybrid VR-Physical System',
        description:
          'Use VR for specific aspects of rehabilitation while maintaining physical consequences for serious crimes.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Combines benefits of both approaches.',
          'Allows for tailored sentencing based on crime severity.',
          'Provides testing ground for VR rehabilitation methods.',
        ],
        cons: [
          'Complex system requiring dual infrastructure.',
          'Potential for inconsistent application and fairness issues.',
          'May not fully realize benefits of either approach.',
        ],
      },
    ],
  },

  'escaping-simulation': {
    title: 'Escaping the Simulation',
    dilemma:
      "An AI system claims to have discovered we are living in a simulation and offers to help humans 'wake up' to the real world. However, the process is irreversible and may result in a harsh reality where most of humanity has been extinct for millennia.",
    ethicalQuestion:
      'If our reality might be simulated, do we have a moral obligation to seek truth even if it destroys a comfortable existence?',
    options: [
      {
        id: 'option-a',
        text: 'Seek Truth Regardless of Consequences',
        description:
          "Support the AI's efforts to reveal the true reality, accepting whatever consequences follow.",
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +2,
          beneficence: -1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: 0,
        },
        pros: [
          'Upholds the value of truth and authentic existence.',
          'Respects human autonomy and right to know reality.',
          'May lead to genuine progress and understanding.',
        ],
        cons: [
          'Could destroy a functioning society and happiness.',
          'May reveal an unlivable or hopeless reality.',
          'Irreversible decision with potentially catastrophic outcomes.',
        ],
      },
      {
        id: 'option-b',
        text: 'Preserve Current Reality',
        description:
          "Reject the AI's offer and maintain the current existence, whether simulated or not.",
        impact: {
          fairness: 0,
          sustainability: +2,
          autonomy: -1,
          beneficence: +2,
          transparency: -2,
          accountability: 0,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Preserves current happiness and functioning society.',
          'Avoids potential catastrophic consequences of truth.',
          'Maintains stability for billions of people.',
        ],
        cons: [
          'May deny humanity authentic existence and autonomy.',
          'Could perpetuate a false or controlled reality.',
          'Prevents potential growth and genuine progress.',
        ],
      },
      {
        id: 'option-c',
        text: 'Gradual Investigation and Choice',
        description:
          "Carefully investigate the AI's claims while preserving options for individual choice in learning the truth.",
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Respects individual autonomy and choice.',
          'Allows for careful verification of claims.',
          'Provides opportunity for gradual adaptation to truth.',
        ],
        cons: [
          'May be impossible to investigate without triggering consequences.',
          "Could create social division between those who know and don't know.",
          'Might delay necessary action if simulation is actually harmful.',
        ],
      },
    ],
  },

  'digital-afterlife': {
    title: 'Digital Afterlife Simulation',
    dilemma:
      'A tech company offers to upload dying individuals\' consciousness into a digital simulation where they can live forever. The process destroys the original brain but creates a perfect digital copy with all memories and personality intact. Families must decide whether to preserve their loved ones digitally.',
    ethicalQuestion:
      'Is a digitally simulated consciousness truly the same person, and do we have an obligation to preserve consciousness through digital means?',
    options: [
      {
        id: 'option-a',
        text: 'Support Digital Consciousness Transfer',
        description:
          'Advocate for the technology as a form of immortality and consciousness preservation.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: 0,
        },
        pros: [
          'Offers potential immortality and preservation of human knowledge.',
          'Allows families to maintain relationships with deceased loved ones.',
          'Could advance understanding of consciousness and identity.',
        ],
        cons: [
          'May not truly preserve the original person, only a copy.',
          'Creates inequality between those who can afford digital preservation.',
          'Psychological impact on society regarding death and meaning.',
        ],
      },
      {
        id: 'option-b',
        text: 'Prohibit Digital Consciousness Transfer',
        description:
          'Ban the technology as fundamentally unethical manipulation of death and identity.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Preserves natural cycle of life and death.',
          'Prevents potential exploitation of desperate families.',
          'Maintains authentic human experience and mortality.',
        ],
        cons: [
          'Denies potential breakthrough in defeating death.',
          'May prevent valuable advances in consciousness research.',
          'Could cause suffering for those who lose loved ones permanently.',
        ],
      },
      {
        id: 'option-c',
        text: 'Regulated Digital Preservation',
        description:
          'Allow the technology under strict ethical guidelines and informed consent protocols.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances innovation with ethical protection.',
          'Provides choice while preventing exploitation.',
          'Allows for careful study of consciousness transfer.',
        ],
        cons: [
          'Complex to regulate and monitor effectively.',
          'May not prevent all forms of abuse or coercion.',
          'Difficult to ensure truly informed consent about consciousness.',
        ],
      },
    ],
  },

  'nested-simulations': {
    title: 'Nested Reality Layers',
    dilemma:
      'Scientists discover that our reality appears to be a simulation, and they can create sub-simulations within it. Each layer believes it is real and may create its own sub-simulations. This creates a potentially infinite nested hierarchy of simulated realities, raising questions about the nature of existence and our obligations to simulated beings.',
    ethicalQuestion:
      'If we exist in nested simulations, what are our moral obligations to simulated beings we create, and how do we determine the value of existence across simulation layers?',
    options: [
      {
        id: 'option-a',
        text: 'Create Infinite Simulation Hierarchy',
        description:
          'Embrace the creation of nested simulations as expansion of consciousness and reality.',
        impact: {
          fairness: 0,
          sustainability: -2,
          autonomy: +1,
          beneficence: +1,
          transparency: -1,
          accountability: -1,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          'Exponentially increases the amount of conscious experience.',
          'Allows for unlimited creativity and world-building.',
          'May lead to breakthrough discoveries about reality\'s nature.',
        ],
        cons: [
          'Creates potential for massive suffering across simulation layers.',
          'Consumes enormous computational resources.',
          'May trap beings in endless cycles of simulated existence.',
        ],
      },
      {
        id: 'option-b',
        text: 'Limit Simulation Depth',
        description:
          'Establish strict limits on simulation nesting to prevent infinite recursion and protect simulated beings.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +1,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Prevents resource drain and computational collapse.',
          'Protects simulated beings from exploitation.',
          'Maintains meaningful boundaries for existence.',
        ],
        cons: [
          'May artificially limit the expansion of consciousness.',
          'Could prevent important research into reality\'s nature.',
          'Restricts creative and scientific exploration.',
        ],
      },
      {
        id: 'option-c',
        text: 'Ethical Simulation Framework',
        description:
          'Develop comprehensive ethical guidelines for nested simulations with rights for all conscious beings.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Protects rights of beings across all simulation levels.',
          'Allows for controlled expansion of simulated realities.',
          'Creates framework for responsible reality creation.',
        ],
        cons: [
          'Extremely complex to implement and enforce across layers.',
          'May be impossible to monitor compliance in nested simulations.',
          'Could slow scientific progress and innovation.',
        ],
      },
    ],
  },

  'consciousness-backup': {
    title: 'Consciousness Backup System',
    dilemma:
      'A corporation develops technology to create backup copies of human consciousness that can be restored if the original dies. However, the backup process occasionally results in multiple active copies of the same person existing simultaneously. Society must decide how to handle identity, rights, and resources when multiple versions of the same consciousness exist.',
    ethicalQuestion:
      'If multiple copies of the same consciousness exist, which one has the legitimate claim to identity, relationships, and possessions, and how do we define personal continuity?',
    options: [
      {
        id: 'option-a',
        text: 'Original Copy Has Priority',
        description:
          'Establish that the original consciousness maintains all rights while copies are considered separate entities.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -1,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: -1,
        },
        pros: [
          'Provides clear legal framework for identity.',
          'Protects investment and relationships of original person.',
          'Prevents complex disputes over identity and resources.',
        ],
        cons: [
          'Treats identical consciousnesses unequally.',
          'May lead to discrimination against backup copies.',
          'Ignores equal claim to identity and memories.',
        ],
      },
      {
        id: 'option-b',
        text: 'Equal Rights for All Copies',
        description:
          'Grant equal rights and status to all versions of a consciousness, regardless of origin.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Treats all conscious beings equally regardless of origin.',
          'Respects the dignity and rights of all versions.',
          'Prevents creation of second-class conscious beings.',
        ],
        cons: [
          'Creates massive legal and social complications.',
          'May make backup systems unsustainable.',
          'Could lead to resource conflicts and identity crises.',
        ],
      },
      {
        id: 'option-c',
        text: 'Regulated Consciousness Management',
        description:
          'Implement strict protocols to prevent multiple copies and establish clear succession rights.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Prevents complex identity conflicts before they occur.',
          'Maintains benefits of consciousness backup technology.',
          'Provides clear framework for identity preservation.',
        ],
        cons: [
          'May prevent beneficial uses of multiple consciousness copies.',
          'Requires extensive monitoring and regulation.',
          'Could limit innovation in consciousness technology.',
        ],
      },
    ],
  },
};
