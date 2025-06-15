const { useState, useEffect } = React;
const { RotateCcw, Trophy, Mountain, Trees, Wheat, Waves, MapPin, Plus, Minus, HelpCircle } = lucide;

// Custom CSS to hide number input spinners and add celebration animations
const hideSpinnersStyle = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }

  @keyframes wiggle {
    0%, 7% {
      transform: rotateZ(0);
    }
    15% {
      transform: rotateZ(-15deg);
    }
    20% {
      transform: rotateZ(10deg);
    }
    25% {
      transform: rotateZ(-10deg);
    }
    30% {
      transform: rotateZ(6deg);
    }
    35% {
      transform: rotateZ(-4deg);
    }
    40%, 100% {
      transform: rotateZ(0);
    }
  }

  @keyframes sparkle {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: scale(1) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes confetti {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes slideIn {
    0% {
      transform: translateY(-100px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .celebrate-bounce {
    animation: bounce 2s infinite;
  }

  .celebrate-wiggle {
    animation: wiggle 2s infinite;
  }

  .celebrate-float {
    animation: float 3s ease-in-out infinite;
  }

  .celebrate-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .celebrate-sparkle {
    animation: sparkle 2s linear infinite;
  }

  .celebrate-confetti {
    animation: confetti 3s linear infinite;
  }

  .celebrate-slide-in {
    animation: slideIn 0.8s ease-out forwards;
  }
`;

const CascadiaCalculator = () => {
  const [gameType, setGameType] = useState('A');
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState([
    { name: 'Fe', scores: {} },
    { name: 'Zo', scores: {} }
  ]);
  const [expandedHelp, setExpandedHelp] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);

  // Wildlife scoring detailed information
  const wildlifeScoring = {
    bear: {
      A: { 
        type: 'pairs', 
        description: 'Score for pairs of bears (no groups can touch each other)',
        helper: 'Count your bear pairs: 1st pair = 4pts, 2nd pair = 11pts, 3rd pair = 19pts, 4th pair = 27pts',
        examples: '2 bears = 4pts, 4 bears = 11pts, 6 bears = 19pts, 8 bears = 27pts',
        maxRealistic: 27
      },
      B: { 
        type: 'groups', 
        description: '10 points per group of exactly 3 bears',
        helper: 'Count groups of exactly 3 bears. Each group = 10pts. Groups cannot touch each other.',
        examples: '3 bears = 10pts, 6 bears = 20pts, 9 bears = 30pts',
        maxRealistic: 40
      },
      C: { 
        type: 'mixed', 
        description: 'Groups of 1-3 bears, +3 bonus for having all sizes',
        helper: 'Singles=2pts, Pairs=5pts, Triples=8pts. +3 bonus if you have at least one of each size.',
        examples: '1+2+3 bears = 2+5+8+3 = 18pts',
        maxRealistic: 35
      },
      D: { 
        type: 'groups', 
        description: 'Score for groups of 2-4 bears',
        helper: 'Count each group: 2 bears=3pts, 3 bears=7pts, 4 bears=12pts',
        examples: 'Two groups of 3 = 14pts, One group of 4 = 12pts',
        maxRealistic: 30
      }
    },
    elk: {
      A: { 
        type: 'lines', 
        description: 'Score for straight lines of elk (flat edge to flat edge)',
        helper: 'Count each straight line: 2=2pts, 3=5pts, 4=9pts, 5=14pts',
        examples: 'Line of 3 + Line of 2 = 5+2 = 7pts',
        maxRealistic: 28
      },
      B: { 
        type: 'shapes', 
        description: 'Score for specific L and I shapes shown on card',
        helper: 'Look at the card for exact shapes. Each shape has specific point values.',
        examples: 'Refer to your Type B Elk card for shape scoring',
        maxRealistic: 25
      },
      C: { 
        type: 'groups', 
        description: 'Any shape groups: bigger groups = more points',
        helper: 'Count each connected group: 1=1pt, 2=3pts, 3=6pts, 4=10pts, 5=15pts, 6=21pts',
        examples: 'Group of 4 + Group of 2 = 10+3 = 13pts',
        maxRealistic: 36
      },
      D: { 
        type: 'circles', 
        description: 'Score for circular formations shown on card',
        helper: 'Form circles as shown on the card. Each complete circle scores points.',
        examples: 'Refer to your Type D Elk card for circle patterns',
        maxRealistic: 20
      }
    },
    salmon: {
      A: { 
        type: 'runs', 
        description: 'Score for runs (chains) up to 7 salmon',
        helper: 'Count each run: 1=2pts, 2=4pts, 3=7pts, 4=11pts, 5=16pts, 6=22pts, 7=28pts',
        examples: 'Run of 4 + Run of 2 = 11+4 = 15pts',
        maxRealistic: 56
      },
      B: { 
        type: 'runs', 
        description: 'Score for runs up to 5 salmon',
        helper: 'Count each run: 1=1pt, 2=3pts, 3=6pts, 4=10pts, 5=15pts',
        examples: 'Run of 5 + Run of 3 = 15+6 = 21pts',
        maxRealistic: 30
      },
      C: { 
        type: 'runs', 
        description: 'Only runs of 3-5 score points',
        helper: 'Ignore runs of 1-2. Count runs: 3=4pts, 4=8pts, 5=12pts',
        examples: 'Run of 4 + Run of 3 = 8+4 = 12pts',
        maxRealistic: 24
      },
      D: { 
        type: 'adjacent', 
        description: '1pt per salmon + 1pt per adjacent animal',
        helper: 'Count all salmon, then count every adjacent animal (any type) next to any salmon.',
        examples: '3 salmon + 5 adjacent animals = 8pts',
        maxRealistic: 40
      }
    },
    hawk: {
      A: { 
        type: 'isolated', 
        description: 'Score isolated hawks (not touching any other hawks)',
        helper: 'Count isolated hawks: 1=2pts, 2=5pts, 3=8pts, 4=11pts, 5=14pts, 6=18pts, etc.',
        examples: '4 isolated hawks = 11pts',
        maxRealistic: 30
      },
      B: { 
        type: 'sight', 
        description: 'Isolated hawks with line of sight to other hawks',
        helper: 'Hawks must be isolated AND have line of sight: 1=3pts, 2=6pts, 3=10pts, 4=14pts, etc.',
        examples: '3 isolated hawks with line of sight = 10pts',
        maxRealistic: 35
      },
      C: { 
        type: 'lines', 
        description: '3 points per line of sight between any two hawks',
        helper: 'Count every line of sight between hawks. Each line = 3pts.',
        examples: '4 lines of sight = 12pts',
        maxRealistic: 30
      },
      D: { 
        type: 'pairs', 
        description: 'Hawk pairs score by unique animals between them',
        helper: 'Form pairs. Count unique animal types between each pair: 0=0pts, 1=2pts, 2=5pts, 3=9pts, 4=14pts',
        examples: 'Pair with 2 unique animals between = 5pts',
        maxRealistic: 25
      }
    },
    fox: {
      A: { 
        type: 'adjacent', 
        description: 'Score per unique adjacent animal types (including other foxes)',
        helper: 'For each fox, count unique animal types touching it: 1=1pt, 2=3pts, 3=5pts, 4=7pts, 5=9pts, 6=12pts',
        examples: 'Fox touching bear+elk+salmon = 5pts',
        maxRealistic: 30
      },
      B: { 
        type: 'pairs', 
        description: 'Score per unique animal pairs adjacent',
        helper: 'For each fox, count unique animal pairs nearby: 1=1pt, 2=4pts, 3=8pts, 4=12pts',
        examples: 'Fox near bear pair + elk pair = 4pts',
        maxRealistic: 25
      },
      C: { 
        type: 'most', 
        description: 'Score most abundant adjacent animal type only',
        helper: 'For each fox, count only the most common adjacent animal type: 2=3pts, 3=5pts, 4=7pts',
        examples: 'Fox touching 3 bears + 1 elk = 5pts (only count bears)',
        maxRealistic: 20
      },
      D: { 
        type: 'pair_bonus', 
        description: 'Fox pairs score by adjacent animal pairs',
        helper: 'Form fox pairs. Count animal pairs near the fox pair: 1=2pts, 2=6pts, 3=12pts, 4=18pts',
        examples: 'Fox pair near 2 animal pairs = 6pts',
        maxRealistic: 30
      }
    }
  };

  const habitats = [
    { key: 'mountains', name: 'Mountains', icon: Mountain, emoji: '🏔️' },
    { key: 'forests', name: 'Forests', icon: Trees, emoji: '🌲' },
    { key: 'prairies', name: 'Prairies', icon: Wheat, emoji: '🌾' },
    { key: 'wetlands', name: 'Wetlands', icon: Waves, emoji: '🌊' },
    { key: 'rivers', name: 'Rivers', icon: MapPin, emoji: '🏞️' }
  ];

  const wildlifeAnimals = [
    { key: 'bear', name: 'Bear', emoji: '🐻' },
    { key: 'elk', name: 'Elk', emoji: '🦌' },
    { key: 'salmon', name: 'Salmon', emoji: '🐟' },
    { key: 'hawk', name: 'Hawk', emoji: '🦅' },
    { key: 'fox', name: 'Fox', emoji: '🦊' }
  ];

  // Initialize players when count changes
  useEffect(() => {
    const defaultNames = ['Fe', 'Zo', 'Ra', 'Hu', 'Nu'];
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      name: players[i]?.name || defaultNames[i] || `Player ${i + 1}`,
      scores: players[i]?.scores || {}
    }));
    setPlayers(newPlayers);
  }, [playerCount]);

  const updatePlayerName = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const updateScore = (playerIndex, category, value) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].scores[category] = Math.max(0, parseInt(value) || 0);
    setPlayers(newPlayers);
  };

  const adjustScore = (playerIndex, category, delta) => {
    const currentScore = getScore(playerIndex, category);
    updateScore(playerIndex, category, Math.max(0, currentScore + delta));
  };

  const getScore = (playerIndex, category) => {
    return players[playerIndex]?.scores[category] || 0;
  };

  const isScoreUnusual = (playerIndex, animal) => {
    const score = getScore(playerIndex, animal);
    const maxRealistic = wildlifeScoring[animal][gameType].maxRealistic;
    return score > maxRealistic;
  };

  // Smart habitat majority calculation (fixed version)
  const calculateHabitatMajority = (playerIndex, habitatKey) => {
    const corridorSizes = players.map((_, i) => getScore(i, `${habitatKey}_corridor`));
    const playerSize = corridorSizes[playerIndex];
    
    // No bonus if corridor size is 0
    if (playerSize === 0) return 0;
    
    if (playerCount === 1) {
      // Solo: 2 points if 7 or more
      return playerSize >= 7 ? 2 : 0;
    } else if (playerCount === 2) {
      // 2-player: 2 points for largest, 1 each if tied
      const maxSize = Math.max(...corridorSizes);
      const maxCount = corridorSizes.filter(size => size === maxSize && size > 0).length;
      
      if (playerSize === maxSize && playerSize > 0) {
        return maxCount > 1 ? 1 : 2;
      }
      return 0;
    } else {
      // 3/4-player: 3 for largest, 1 for second
      const nonZeroSizes = corridorSizes.filter(size => size > 0);
      if (nonZeroSizes.length === 0) return 0;
      
      const sortedUnique = [...new Set(nonZeroSizes)].sort((a, b) => b - a);
      const largest = sortedUnique[0];
      const secondLargest = sortedUnique[1] || 0;
      
      const largestCount = corridorSizes.filter(size => size === largest).length;
      const secondCount = corridorSizes.filter(size => size === secondLargest && size > 0).length;
      
      if (playerSize === largest) {
        if (largestCount === 1) return 3;
        if (largestCount === 2) return 2;
        return 1; // 3+ tied for first
      } else if (playerSize === secondLargest && playerSize > 0 && largestCount === 1) {
        return secondCount === 1 ? 1 : 0; // Only if not tied for second
      }
      return 0;
    }
  };

  const calculateWildlifeTotal = (playerIndex) => {
    return wildlifeAnimals.reduce((total, animal) => {
      return total + (getScore(playerIndex, animal.key) || 0);
    }, 0);
  };

  const calculateHabitatTotal = (playerIndex) => {
    return habitats.reduce((total, habitat) => {
      const corridor = getScore(playerIndex, `${habitat.key}_corridor`) || 0;
      const majority = calculateHabitatMajority(playerIndex, habitat.key);
      return total + corridor + majority;
    }, 0);
  };

  const calculateTotalScore = (playerIndex) => {
    const wildlife = calculateWildlifeTotal(playerIndex);
    const habitat = calculateHabitatTotal(playerIndex);
    const nature = getScore(playerIndex, 'nature_tokens') || 0;
    return wildlife + habitat + nature;
  };

  const resetAllScores = () => {
    const newPlayers = players.map(player => ({
      ...player,
      scores: {}
    }));
    setPlayers(newPlayers);
  };

  const toggleHelp = (animalKey) => {
    setExpandedHelp(prev => ({
      ...prev,
      [animalKey]: !prev[animalKey]
    }));
  };

  const getRanking = () => {
    const scores = players.map((player, index) => ({
      name: player.name,
      score: calculateTotalScore(index),
      nature: getScore(index, 'nature_tokens') || 0,
      wildlife: calculateWildlifeTotal(index),
      habitat: calculateHabitatTotal(index),
      index
    }));
    
    scores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.nature - a.nature;
    });
    
    return scores;
  };

  const getScoreCategory = (score, isWinner = false) => {
    // Winners always get a positive message, even with low scores
    if (isWinner && score < 60) return { label: 'Victory!', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    
    if (score >= 110) return { label: 'Ascended!', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (score >= 100) return { label: 'Elite!', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 90) return { label: 'Excellent!', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 80) return { label: 'Very Good!', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 70) return { label: 'Getting it!', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (score >= 60) return { label: 'Good start!', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    return { label: 'Keep trying!', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const celebrateWinner = () => {
    const ranking = getRanking();
    if (ranking.length > 0) {
      // NO SCROLLING! Show celebration right where you are!
      setShowCelebration(true);
      
      // Auto-close after 12 seconds for the epic celebration
      setTimeout(() => {
        setShowCelebration(false);
      }, 12000);
    }
  };

  const CelebrationModal = () => {
    const winner = getRanking()[0];
    if (!winner) return null;

    const cascadiaAnimals = [
      { emoji: '🐻', name: 'Bear', message: 'ROARS!', delay: '0.3s' },
      { emoji: '🦌', name: 'Elk', message: 'PRANCES!', delay: '0.6s' },
      { emoji: '🐟', name: 'Salmon', message: 'LEAPS!', delay: '0.9s' },
      { emoji: '🦅', name: 'Hawk', message: 'SOARS!', delay: '1.2s' },
      { emoji: '🦊', name: 'Fox', message: 'DANCES!', delay: '1.5s' }
    ];

    const sparkleElements = ['✨', '⭐', '💫', '🌟'];

    return React.createElement('div', {
      className: "fixed inset-0 bg-gradient-to-br from-green-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md z-50 overflow-hidden"
    }, [
      // Background Effects
      React.createElement('div', {
        key: 'bg',
        className: "absolute inset-0 overflow-hidden pointer-events-none"
      }, [
        // Floating sparkles
        ...Array.from({ length: 15 }).map((_, i) => 
          React.createElement('div', {
            key: `sparkle-${i}`,
            className: "absolute text-lg celebrate-sparkle",
            style: {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random()}s`
            }
          }, sparkleElements[Math.floor(Math.random() * sparkleElements.length)])
        ),
        // Falling leaves
        ...Array.from({ length: 10 }).map((_, i) => 
          React.createElement('div', {
            key: `leaf-${i}`,
            className: "absolute text-2xl celebrate-confetti",
            style: {
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }
          }, Math.random() > 0.5 ? '🍂' : '🌿')
        )
      ]),
      
      // BOTTOM CELEBRATION
      React.createElement('div', {
        key: 'celebration',
        className: "absolute bottom-0 left-0 right-0 flex justify-center p-4"
      }, React.createElement('div', {
        className: "bg-gradient-to-br from-green-800/70 via-blue-800/70 to-purple-800/70 backdrop-blur-xl rounded-2xl border-2 border-yellow-400/80 shadow-2xl p-4 text-center relative overflow-hidden w-full max-w-sm"
      }, [
        // Glowing border effect
        React.createElement('div', {
          key: 'glow',
          className: "absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-green-400/30 to-blue-400/30 rounded-2xl blur-lg"
        }),
        
        // Close Button
        React.createElement('button', {
          key: 'close',
          onClick: () => setShowCelebration(false),
          className: "absolute top-2 right-2 text-white hover:text-yellow-300 text-2xl z-30 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center font-bold"
        }, '×'),

        // Header
        React.createElement('div', {
          key: 'header',
          className: "relative z-20 celebrate-slide-in mb-3"
        }, [
          React.createElement('div', {
            key: 'trophy',
            className: "text-4xl mb-2 celebrate-bounce"
          }, '🏆'),
          React.createElement('h1', {
            key: 'title',
            className: "text-2xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2 celebrate-pulse"
          }, 'CASCADIA VICTORY!'),
          React.createElement('div', {
            key: 'winner',
            className: "text-xl text-white mb-2 celebrate-wiggle font-bold"
          }, `🎉 ${winner.name} WINS! 🎉`),
          React.createElement('div', {
            key: 'score',
            className: "text-lg text-yellow-300 mb-1 font-semibold"
          }, `Score: ${winner.score} Points`),
          React.createElement('div', {
            key: 'breakdown',
            className: "text-sm text-blue-300 mb-3"
          }, `W:${winner.wildlife} • H:${winner.habitat} • N:${winner.nature}`)
        ]),

        // Forest Proclamation
        React.createElement('div', {
          key: 'forest',
          className: "celebrate-slide-in mb-3",
          style: { animationDelay: '0.5s' }
        }, [
          React.createElement('div', {
            key: 'declares',
            className: "text-lg text-green-300 mb-2 celebrate-float font-bold"
          }, '🌲 THE FOREST DECLARES 🌲'),
          React.createElement('div', {
            key: 'master',
            className: "text-sm text-white mb-3 font-semibold"
          }, '"Master of the Wild Cascadia!"')
        ]),

        // Animals Grid
        React.createElement('div', {
          key: 'animals',
          className: "grid grid-cols-5 gap-2 mb-3"
        }, cascadiaAnimals.map((animal, index) => 
          React.createElement('div', {
            key: animal.name,
            className: "text-center celebrate-slide-in",
            style: { animationDelay: animal.delay }
          }, [
            React.createElement('div', {
              key: 'emoji',
              className: `text-3xl mb-1 ${index % 2 === 0 ? 'celebrate-bounce' : 'celebrate-wiggle'}`,
              style: { animationDelay: animal.delay }
            }, animal.emoji),
            React.createElement('div', {
              key: 'message',
              className: "text-yellow-400 text-xs font-bold"
            }, animal.message)
          ])
        )),

        // Ecosystem Tribute
        React.createElement('div', {
          key: 'ecosystem',
          className: "celebrate-slide-in mb-3",
          style: { animationDelay: '1.5s' }
        }, [
          React.createElement('div', {
            key: 'mountains',
            className: "text-base text-purple-300 mb-2 celebrate-pulse font-bold"
          }, '🗻 FROM MOUNTAINS TO SEAS 🌊'),
          React.createElement('div', {
            key: 'habitats',
            className: "flex justify-center gap-3 text-2xl mb-3"
          }, ['🏔️', '🌲', '🌾', '🌊', '🏞️'].map((emoji, i) => 
            React.createElement('span', {
              key: i,
              className: i % 2 === 0 ? 'celebrate-bounce' : 'celebrate-wiggle',
              style: { animationDelay: `${0.1 * (i + 1)}s` }
            }, emoji)
          ))
        ]),

        // Grand Finale
        React.createElement('div', {
          key: 'finale',
          className: "celebrate-slide-in",
          style: { animationDelay: '2s' }
        }, [
          React.createElement('div', {
            key: 'sparkles',
            className: "flex justify-center gap-2 text-2xl mb-3"
          }, sparkleElements.map((sparkle, i) => 
            React.createElement('span', {
              key: i,
              className: "celebrate-sparkle",
              style: { 
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }
            }, sparkle)
          )),
          
          React.createElement('div', {
            key: 'badge',
            className: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black px-4 py-2 rounded-xl font-bold text-sm celebrate-pulse shadow-xl"
          }, '👑 CASCADIA CHAMPION 👑'),
          
          React.createElement('div', {
            key: 'remember',
            className: "text-xs text-green-300 mt-2 font-semibold"
          }, 'Forever remembered in the great forest! 🌲✨')
        ])
      ]))
    ]);
  };

  return React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 text-white"
  }, [
    // Inject CSS
    React.createElement('style', {
      key: 'styles',
      dangerouslySetInnerHTML: { __html: hideSpinnersStyle }
    }),
    
    React.createElement('div', {
      key: 'container',
      className: "max-w-6xl mx-auto p-4"
    }, [
      React.createElement('div', {
        key: 'main',
        className: "bg-gradient-to-br from-slate-800/90 to-green-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-500/20"
      }, [
        // Header
        React.createElement('div', {
          key: 'header',
          className: "text-center p-8 border-b border-green-500/20"
        }, [
          React.createElement('div', {
            key: 'title-row',
            className: "flex items-center justify-center gap-4 mb-4"
          }, [
            React.createElement(Mountain, {
              key: 'mountain',
              className: "text-green-400",
              size: 32
            }),
            React.createElement('h1', {
              key: 'title',
              className: "text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"
            }, 'Cascadia FeZoRaHuNu Calculator'),
            React.createElement(Trees, {
              key: 'trees',
              className: "text-green-400",
              size: 32
            })
          ]),
          React.createElement('p', {
            key: 'subtitle',
            className: "text-green-300 text-lg"
          }, 'Epic Professional Score Calculator with Victory Ceremonies!')
        ]),

        // Game Setup
        React.createElement('div', {
          key: 'game-setup',
          className: "p-6 border-b border-green-500/20"
        }, React.createElement('div', {
          className: "grid grid-cols-1 md:grid-cols-2 gap-6"
        }, [
          React.createElement('div', {
            key: 'game-type',
            className: "space-y-2"
          }, [
            React.createElement('label', {
              key: 'label',
              className: "block text-sm font-medium text-green-300"
            }, 'Wildlife Cards Type'),
            React.createElement('select', {
              key: 'select',
              value: gameType,
              onChange: (e) => setGameType(e.target.value),
              className: "w-full p-3 bg-slate-700/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
            }, [
              React.createElement('option', { key: 'A', value: 'A' }, 'Type A - Beginner Friendly'),
              React.createElement('option', { key: 'B', value: 'B' }, 'Type B - Intermediate'),
              React.createElement('option', { key: 'C', value: 'C' }, 'Type C - Advanced'),
              React.createElement('option', { key: 'D', value: 'D' }, 'Type D - Expert'),
              React.createElement('option', { key: 'Family', value: 'Family' }, 'Family Variant'),
              React.createElement('option', { key: 'Intermediate', value: 'Intermediate' }, 'Intermediate Variant')
            ])
          ]),
          React.createElement('div', {
            key: 'player-count',
            className: "space-y-2"
          }, [
            React.createElement('label', {
              key: 'label',
              className: "block text-sm font-medium text-green-300"
            }, 'Number of Players'),
            React.createElement('select', {
              key: 'select',
              value: playerCount,
              onChange: (e) => setPlayerCount(parseInt(e.target.value)),
              className: "w-full p-3 bg-slate-700/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
            }, [
              React.createElement('option', { key: '1', value: 1 }, '1 Player (Solo Mode)'),
              React.createElement('option', { key: '2', value: 2 }, '2 Players'),
              React.createElement('option', { key: '3', value: 3 }, '3 Players'),
              React.createElement('option', { key: '4', value: 4 }, '4 Players')
            ])
          ])
        ])),

        // Player Names
        React.createElement('div', {
          key: 'player-names',
          className: "p-6 border-b border-green-500/20"
        }, [
          React.createElement('h3', {
            key: 'title',
            className: "text-xl font-semibold mb-4 text-green-300"
          }, '🎮 Player Setup'),
          React.createElement('div', {
            key: 'grid',
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          }, players.map((player, index) => 
            React.createElement('div', {
              key: index,
              className: "space-y-2"
            }, [
              React.createElement('label', {
                key: 'label',
                className: "block text-sm text-green-300"
              }, `Player ${index + 1}`),
              React.createElement('input', {
                key: 'input',
                type: "text",
                value: player.name,
                onChange: (e) => updatePlayerName(index, e.target.value),
                className: "w-full p-3 bg-slate-700/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent",
                placeholder: `Player ${index + 1}`
              })
            ])
          ))
        ]),

        // Scoring Sections
        React.createElement('div', {
          key: 'scoring',
          className: "p-6 space-y-8"
        }, [
          // Wildlife Scoring
          React.createElement('div', {
            key: 'wildlife',
            className: "space-y-4"
          }, [
            React.createElement('div', {
              key: 'wildlife-header',
              className: "flex items-center gap-3 mb-6"
            }, [
              React.createElement('div', {
                key: 'icon',
                className: "p-2 bg-amber-500/20 rounded-lg"
              }, React.createElement('span', {
                className: "text-2xl"
              }, '🦌')),
              React.createElement('div', {
                key: 'text'
              }, [
                React.createElement('h2', {
                  key: 'title',
                  className: "text-2xl font-bold text-amber-400"
                }, 'Wildlife Scoring'),
                React.createElement('p', {
                  key: 'subtitle',
                  className: "text-amber-300/80"
                }, `Type ${gameType} Wildlife Cards`)
              ])
            ]),

            React.createElement('div', {
              key: 'wildlife-grid',
              className: "grid gap-4"
            }, wildlifeAnimals.map((animal) => {
              const scoring = wildlifeScoring[animal.key][gameType] || wildlifeScoring[animal.key]['A'];
              return React.createElement('div', {
                key: animal.key,
                className: "bg-slate-700/30 rounded-xl border border-amber-500/20"
              }, React.createElement('div', {
                className: "p-4"
              }, [
                React.createElement('div', {
                  key: 'animal-row',
                  className: "flex flex-col lg:flex-row lg:items-center gap-4"
                }, [
                  React.createElement('div', {
                    key: 'animal-info',
                    className: "flex-1"
                  }, [
                    React.createElement('div', {
                      key: 'animal-header',
                      className: "flex items-center gap-3 mb-2"
                    }, [
                      React.createElement('span', {
                        key: 'emoji',
                        className: "text-2xl"
                      }, animal.emoji),
                      React.createElement('h3', {
                        key: 'name',
                        className: "text-lg font-semibold text-amber-300"
                      }, animal.name),
                      React.createElement('button', {
                        key: 'help',
                        onClick: () => toggleHelp(animal.key),
                        className: "p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                      }, React.createElement(HelpCircle, {
                        size: 16,
                        className: "text-amber-400"
                      }))
                    ]),
                    React.createElement('p', {
                      key: 'description',
                      className: "text-sm text-gray-300 mb-1"
                    }, scoring.description)
                  ]),
                  React.createElement('div', {
                    key: 'player-inputs',
                    className: "flex gap-2 flex-wrap justify-center"
                  }, players.map((player, playerIndex) => 
                    React.createElement('div', {
                      key: playerIndex,
                      className: "text-center min-w-0"
                    }, [
                      React.createElement('label', {
                        key: 'label',
                        className: "block text-xs text-gray-400 mb-1 truncate"
                      }, player.name),
                      React.createElement('div', {
                        key: 'controls',
                        className: "flex items-center gap-1"
                      }, [
                        React.createElement('button', {
                          key: 'minus',
                          onClick: () => adjustScore(playerIndex, animal.key, -1),
                          className: "p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-amber-500/30 text-amber-400 flex-shrink-0"
                        }, React.createElement(Minus, { size: 14 })),
                        React.createElement('input', {
                          key: 'input',
                          type: "number",
                          min: "0",
                          value: getScore(playerIndex, animal.key),
                          onChange: (e) => updateScore(playerIndex, animal.key, e.target.value),
                          className: `w-16 p-2 bg-slate-600/50 border rounded-lg text-center text-white focus:ring-2 focus:ring-amber-400 ${
                            isScoreUnusual(playerIndex, animal.key) ? 'border-red-500 bg-red-900/20' : 'border-amber-500/30'
                          }`
                        }),
                        React.createElement('button', {
                          key: 'plus',
                          onClick: () => adjustScore(playerIndex, animal.key, 1),
                          className: "p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-amber-500/30 text-amber-400 flex-shrink-0"
                        }, React.createElement(Plus, { size: 14 }))
                      ]),
                      isScoreUnusual(playerIndex, animal.key) && React.createElement('div', {
                        key: 'warning',
                        className: "text-xs text-red-400 mt-1"
                      }, 'Unusually high!')
                    ])
                  ))
                ]),
                
                // Expandable Help
                expandedHelp[animal.key] && React.createElement('div', {
                  key: 'help-expanded',
                  className: "mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20"
                }, [
                  React.createElement('div', {
                    key: 'helper',
                    className: "text-sm text-amber-300 mb-2"
                  }, [
                    React.createElement('strong', null, 'How to Score: '),
                    scoring.helper
                  ]),
                  React.createElement('div', {
                    key: 'examples',
                    className: "text-xs text-amber-400"
                  }, [
                    React.createElement('strong', null, 'Examples: '),
                    scoring.examples
                  ])
                ])
              ]))
            })),

            React.createElement('div', {
              key: 'wildlife-subtotal',
              className: "bg-amber-500/10 rounded-xl p-4 border border-amber-500/30"
            }, React.createElement('div', {
              className: "flex justify-between items-center"
            }, [
              React.createElement('span', {
                key: 'label',
                className: "text-lg font-semibold text-amber-300"
              }, 'Wildlife Subtotal'),
              React.createElement('div', {
                key: 'totals',
                className: "flex gap-6"
              }, players.map((player, index) => 
                React.createElement('div', {
                  key: index,
                  className: "text-center"
                }, [
                  React.createElement('div', {
                    key: 'name',
                    className: "text-sm text-gray-400"
                  }, player.name),
                  React.createElement('div', {
                    key: 'total',
                    className: "text-2xl font-bold text-amber-400"
                  }, calculateWildlifeTotal(index))
                ])
              ))
            ]))
          ]),

          // Habitat Scoring
          React.createElement('div', {
            key: 'habitat',
            className: "space-y-4"
          }, [
            React.createElement('div', {
              key: 'habitat-header',
              className: "flex items-center gap-3 mb-6"
            }, [
              React.createElement('div', {
                key: 'icon',
                className: "p-2 bg-green-500/20 rounded-lg"
              }, React.createElement(Mountain, {
                className: "text-green-400",
                size: 24
              })),
              React.createElement('div', {
                key: 'text'
              }, [
                React.createElement('h2', {
                  key: 'title',
                  className: "text-2xl font-bold text-green-400"
                }, 'Habitat Scoring'),
                React.createElement('p', {
                  key: 'subtitle',
                  className: "text-green-300/80"
                }, 'Corridor sizes & automatic majority bonuses')
              ])
            ]),

            React.createElement('div', {
              key: 'habitat-grid',
              className: "grid gap-4"
            }, habitats.map((habitat) => 
              React.createElement('div', {
                key: habitat.key,
                className: "bg-slate-700/30 rounded-xl p-4 border border-green-500/20"
              }, React.createElement('div', {
                className: "flex flex-col lg:flex-row lg:items-center gap-4"
              }, [
                React.createElement('div', {
                  key: 'habitat-info',
                  className: "flex-1"
                }, [
                  React.createElement('div', {
                    key: 'habitat-header',
                    className: "flex items-center gap-3 mb-2"
                  }, [
                    React.createElement('span', {
                      key: 'emoji',
                      className: "text-2xl"
                    }, habitat.emoji),
                    React.createElement('h3', {
                      key: 'name',
                      className: "text-lg font-semibold text-green-300"
                    }, habitat.name)
                  ]),
                  React.createElement('p', {
                    key: 'description',
                    className: "text-sm text-gray-300"
                  }, 'Enter your largest contiguous corridor size'),
                  React.createElement('p', {
                    key: 'note',
                    className: "text-xs text-green-400"
                  }, 'Majority bonuses calculated automatically')
                ]),
                React.createElement('div', {
                  key: 'player-inputs',
                  className: "flex gap-2 flex-wrap justify-center"
                }, players.map((player, playerIndex) => 
                  React.createElement('div', {
                    key: playerIndex,
                    className: "text-center min-w-0"
                  }, [
                    React.createElement('label', {
                      key: 'label',
                      className: "block text-xs text-gray-400 mb-1 truncate"
                    }, player.name),
                    React.createElement('div', {
                      key: 'controls',
                      className: "flex items-center gap-1"
                    }, [
                      React.createElement('button', {
                        key: 'minus',
                        onClick: () => adjustScore(playerIndex, `${habitat.key}_corridor`, -1),
                        className: "p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-green-500/30 text-green-400 flex-shrink-0"
                      }, React.createElement(Minus, { size: 14 })),
                      React.createElement('input', {
                        key: 'input',
                        type: "number",
                        min: "0",
                        value: getScore(playerIndex, `${habitat.key}_corridor`),
                        onChange: (e) => updateScore(playerIndex, `${habitat.key}_corridor`, e.target.value),
                        className: "w-16 p-2 bg-slate-600/50 border border-green-500/30 rounded-lg text-center text-white focus:ring-2 focus:ring-green-400"
                      }),
                      React.createElement('button', {
                        key: 'plus',
                        onClick: () => adjustScore(playerIndex, `${habitat.key}_corridor`, 1),
                        className: "p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-green-500/30 text-green-400 flex-shrink-0"
                      }, React.createElement(Plus, { size: 14 }))
                    ]),
                    React.createElement('div', {
                      key: 'bonus',
                      className: "text-xs text-green-400 mt-1"
                    }, `+${calculateHabitatMajority(playerIndex, habitat.key)} bonus`)
                  ])
                ))
              ]))
            )),

            React.createElement('div', {
              key: 'habitat-subtotal',
              className: "bg-green-500/10 rounded-xl p-4 border border-green-500/30"
            }, React.createElement('div', {
              className: "flex justify-between items-center"
            }, [
              React.createElement('span', {
                key: 'label',
                className: "text-lg font-semibold text-green-300"
              }, 'Habitat Subtotal'),
              React.createElement('div', {
                key: 'totals',
                className: "flex gap-6"
              }, players.map((player, index) => 
                React.createElement('div', {
                  key: index,
                  className: "text-center"
                }, [
                  React.createElement('div', {
                    key: 'name',
                    className: "text-sm text-gray-400"
                  }, player.name),
                  React.createElement('div', {
                    key: 'total',
                    className: "text-2xl font-bold text-green-400"
                  }, calculateHabitatTotal(index))
                ])
              ))
            ]))
          ]),

          // Nature Tokens
          React.createElement('div', {
            key: 'nature',
            className: "space-y-4"
          }, [
            React.createElement('div', {
              key: 'nature-header',
              className: "flex items-center gap-3 mb-6"
            }, [
              React.createElement('div', {
                key: 'icon',
                className: "p-2 bg-yellow-500/20 rounded-lg"
              }, React.createElement('span', {
                className: "text-2xl"
              }, '🌰')),
              React.createElement('div', {
                key: 'text'
              }, [
                React.createElement('h2', {
                  key: 'title',
                  className: "text-2xl font-bold text-yellow-400"
                }, 'Nature Tokens'),
                React.createElement('p', {
                  key: 'subtitle',
                  className: "text-yellow-300/80"
                }, '1 point each for unused Douglas Fir cones')
              ])
            ]),

            React.createElement('div', {
              key: 'nature-input',
              className: "bg-slate-700/30 rounded-xl p-4 border border-yellow-500/20"
            }, React.createElement('div', {
              className: "flex flex-col lg:flex-row lg:items-center gap-4"
            }, [
              React.createElement('div', {
                key: 'nature-info',
                className: "flex-1"
              }, [
                React.createElement('h3', {
                  key: 'title',
                  className: "text-lg font-semibold text-yellow-300 mb-2"
                }, '🌰 Unused Nature Tokens'),
                React.createElement('p', {
                  key: 'description',
                  className: "text-sm text-gray-300"
                }, 'Count your remaining Douglas Fir cones')
              ]),
              React.createElement('div', {
                key: 'player-inputs',
                className: "flex gap-2 flex-wrap justify-center"
              }, players.map((player, playerIndex) => 
                React.createElement('div', {
                  key: playerIndex,
                  className: "text-center min-w-0"
                }, [
                  React.createElement('label', {
                    key: 'label',
                    className: "block text-xs text-gray-400 mb-1 truncate"
                  }, player.name),
                  React.createElement('div', {
                    key: 'controls',
                    className: "flex items-center gap-1"
                  }, [
                    React.createElement('button', {
                      key: 'minus',
                      onClick: () => adjustScore(playerIndex, 'nature_tokens', -1),
                      className: "p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-yellow-500/30 text-yellow-400 flex-shrink-0"
                    }, React.createElement(Minus, { size: 14 })),
                    React.createElement('input', {
                      key: 'input',
                      type: "number",
                      min: "0",
                      value: getScore(playerIndex, 'nature_tokens'),
                      onChange: (e) => updateScore(playerIndex, 'nature_tokens', e.target.value),
                      className: "w-16 p-2 bg-slate-600/50 border border-yellow-500/30 rounded-lg text-center text-white focus:ring-2 focus:ring-yellow-400"
                    }),
                    React.createElement('button', {
                      key: 'plus',
                      onClick: () => adjustScore(playerIndex, 'nature_tokens', 1),
                      className: "p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-yellow-500/30 text-yellow-400 flex-shrink-0"
                    }, React.createElement(Plus, { size: 14 }))
                  ])
                ])
              ))
            ]))
          ]),

          // Final Results
          React.createElement('div', {
            key: 'results',
            className: "bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30"
          }, [
            React.createElement('div', {
              key: 'results-header',
              className: "flex items-center justify-between mb-6"
            }, [
              React.createElement('div', {
                key: 'title-section',
                className: "flex items-center gap-3"
              }, [
                React.createElement(Trophy, {
                  key: 'trophy',
                  className: "text-blue-400",
                  size: 32
                }),
                React.createElement('h2', {
                  key: 'title',
                  className: "text-3xl font-bold text-blue-400"
                }, 'Final Results')
              ]),
              React.createElement('button', {
                key: 'celebrate',
                onClick: celebrateWinner,
                className: "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              }, '🎉 Celebrate Winner! 🎉')
            ]),

            React.createElement('div', {
              key: 'ranking',
              className: "grid gap-4"
            }, getRanking().map((player, rank) => {
              const category = getScoreCategory(player.score, rank === 0);
              return React.createElement('div', {
                key: player.index,
                className: `p-4 rounded-xl border ${
                  rank === 0 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                    : 'bg-slate-700/30 border-slate-500/30'
                }`
              }, React.createElement('div', {
                className: "flex items-center justify-between"
              }, [
                React.createElement('div', {
                  key: 'player-info',
                  className: "flex items-center gap-4"
                }, [
                  React.createElement('div', {
                    key: 'rank',
                    className: `text-2xl font-bold ${
                      rank === 0 ? 'text-yellow-400' : 
                      rank === 1 ? 'text-gray-300' : 
                      rank === 2 ? 'text-orange-400' : 'text-gray-400'
                    }`
                  }, rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}th`),
                  React.createElement('div', {
                    key: 'details'
                  }, [
                    React.createElement('div', {
                      key: 'name',
                      className: `text-xl font-bold ${rank === 0 ? 'text-yellow-400' : 'text-white'}`
                    }, player.name),
                    React.createElement('div', {
                      key: 'info',
                      className: "flex items-center gap-4 text-sm text-gray-400"
                    }, [
                      React.createElement('span', {
                        key: 'nature'
                      }, `Nature: ${player.nature}`),
                      React.createElement('div', {
                        key: 'category',
                        className: `px-2 py-1 rounded-full text-xs ${category.bg} ${category.color}`
                      }, category.label)
                    ])
                  ])
                ]),
                React.createElement('div', {
                  key: 'score',
                  className: "text-right"
                }, React.createElement('div', {
                  className: `text-3xl font-bold ${rank === 0 ? 'text-yellow-400' : 'text-blue-400'}`
                }, player.score))
              ]));
            }))
          ]),

          // Reset Button
          React.createElement('div', {
            key: 'reset',
            className: "text-center"
          }, React.createElement('button', {
            onClick: resetAllScores,
            className: "flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-semibold transition-all transform hover:scale-105 shadow-lg mx-auto"
          }, [
            React.createElement(RotateCcw, {
              key: 'icon',
              size: 20
            }),
            'Reset All Scores'
          ]))
        ]),

        // Celebration Modal
        showCelebration && React.createElement(CelebrationModal, { key: 'celebration' }),

        // Footer
        React.createElement('div', {
          key: 'footer',
          className: "p-6 border-t border-green-500/20 text-center"
        }, [
          React.createElement('p', {
            key: 'made-with',
            className: "text-green-300 mb-2"
          }, '🌲 Made with ❤️ for Fe, Zo, Ra, Hu & Nu 🦌'),
          React.createElement('p', {
            key: 'description',
            className: "text-gray-400 text-sm"
          }, 'Ultimate Cascadia Board Game Calculator | Auto-saves your progress')
        ])
      ])
    ])
  ]);
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(CascadiaCalculator));
