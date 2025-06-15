import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Mountain, Trees, Wheat, Waves, MapPin, Plus, Minus, HelpCircle, ChevronDown, ChevronUp, Save, Share2, BarChart3 } from 'lucide-react';

// Custom CSS to hide number input spinners and add celebration animations
const hideSpinnersStyle = `
  /* Hide Chrome, Safari, Edge spinners */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Hide Firefox spinners */
  input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Celebration Animations */
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

  // Load saved game state
  useEffect(() => {
    const saved = localStorage.getItem('cascadia-game-state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGameType(data.gameType || 'A');
        setPlayerCount(data.playerCount || 2);
        setPlayers(data.players || players);
      } catch (e) {
        console.log('Could not load saved game');
      }
    }
  }, []);

  // Save game state
  useEffect(() => {
    const gameState = { gameType, playerCount, players };
    localStorage.setItem('cascadia-game-state', JSON.stringify(gameState));
  }, [gameType, playerCount, players]);

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
    localStorage.removeItem('cascadia-game-state');
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

    return (
      <div 
        className="fixed inset-0 bg-gradient-to-br from-green-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md z-50 overflow-hidden"
      >
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating sparkles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute text-lg celebrate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random()}s`
              }}
            >
              {sparkleElements[Math.floor(Math.random() * sparkleElements.length)]}
            </div>
          ))}

          {/* Falling leaves */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`leaf-${i}`}
              className="absolute text-2xl celebrate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            >
              {Math.random() > 0.5 ? '🍂' : '🌿'}
            </div>
          ))}
        </div>

        {/* BOTTOM CELEBRATION - PROPERLY POSITIONED */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
          <div className="bg-gradient-to-br from-green-800/70 via-blue-800/70 to-purple-800/70 backdrop-blur-xl rounded-2xl border-2 border-yellow-400/80 shadow-2xl p-4 text-center relative overflow-hidden w-full max-w-sm">
            
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-green-400/30 to-blue-400/30 rounded-2xl blur-lg"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute top-2 right-2 text-white hover:text-yellow-300 text-2xl z-30 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ×
            </button>

            {/* Header */}
            <div className="relative z-20 celebrate-slide-in mb-3">
              <div className="text-4xl mb-2 celebrate-bounce">🏆</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2 celebrate-pulse">
                CASCADIA VICTORY!
              </h1>
              <div className="text-xl text-white mb-2 celebrate-wiggle font-bold">
                🎉 {winner.name} WINS! 🎉
              </div>
              <div className="text-lg text-yellow-300 mb-1 font-semibold">
                Score: {winner.score} Points
              </div>
              <div className="text-sm text-blue-300 mb-3">
                W:{winner.wildlife} • H:{winner.habitat} • N:{winner.nature}
              </div>
            </div>

            {/* Forest Proclamation */}
            <div className="celebrate-slide-in mb-3" style={{ animationDelay: '0.5s' }}>
              <div className="text-lg text-green-300 mb-2 celebrate-float font-bold">
                🌲 THE FOREST DECLARES 🌲
              </div>
              <div className="text-sm text-white mb-3 font-semibold">
                "Master of the Wild Cascadia!"
              </div>
            </div>

            {/* Animals Grid */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {cascadiaAnimals.map((animal, index) => (
                <div
                  key={animal.name}
                  className="text-center celebrate-slide-in"
                  style={{ animationDelay: animal.delay }}
                >
                  <div 
                    className={`text-3xl mb-1 ${
                      index % 2 === 0 ? 'celebrate-bounce' : 'celebrate-wiggle'
                    }`}
                    style={{ animationDelay: animal.delay }}
                  >
                    {animal.emoji}
                  </div>
                  <div className="text-yellow-400 text-xs font-bold">{animal.message}</div>
                </div>
              ))}
            </div>

            {/* Ecosystem Tribute */}
            <div className="celebrate-slide-in mb-3" style={{ animationDelay: '1.5s' }}>
              <div className="text-base text-purple-300 mb-2 celebrate-pulse font-bold">
                🗻 FROM MOUNTAINS TO SEAS 🌊
              </div>
              <div className="flex justify-center gap-3 text-2xl mb-3">
                <span className="celebrate-bounce" style={{ animationDelay: '0.1s' }}>🏔️</span>
                <span className="celebrate-wiggle" style={{ animationDelay: '0.2s' }}>🌲</span>
                <span className="celebrate-bounce" style={{ animationDelay: '0.3s' }}>🌾</span>
                <span className="celebrate-wiggle" style={{ animationDelay: '0.4s' }}>🌊</span>
                <span className="celebrate-bounce" style={{ animationDelay: '0.5s' }}>🏞️</span>
              </div>
            </div>

            {/* Grand Finale */}
            <div className="celebrate-slide-in" style={{ animationDelay: '2s' }}>
              <div className="flex justify-center gap-2 text-2xl mb-3">
                {sparkleElements.map((sparkle, i) => (
                  <span
                    key={i}
                    className="celebrate-sparkle"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.5s'
                    }}
                  >
                    {sparkle}
                  </span>
                ))}
              </div>
              
              {/* Champion Badge */}
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black px-4 py-2 rounded-xl font-bold text-sm celebrate-pulse shadow-xl">
                👑 CASCADIA CHAMPION 👑
              </div>
              
              <div className="text-xs text-green-300 mt-2 font-semibold">
                Forever remembered in the great forest! 🌲✨
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 text-white">
      {/* Inject CSS to hide number input spinners */}
      <style dangerouslySetInnerHTML={{ __html: hideSpinnersStyle }} />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-green-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-500/20">
          
          {/* Header */}
          <div className="text-center p-8 border-b border-green-500/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Mountain className="text-green-400" size={32} />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Cascadia FeZoRaHuNu Calculator
              </h1>
              <Trees className="text-green-400" size={32} />
            </div>
            <p className="text-green-300 text-lg">Epic Professional Score Calculator with Victory Ceremonies!</p>
          </div>

          {/* Game Setup */}
          <div className="p-6 border-b border-green-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-300">Wildlife Cards Type</label>
                <select 
                  value={gameType} 
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
                >
                  <option value="A">Type A - Beginner Friendly</option>
                  <option value="B">Type B - Intermediate</option>
                  <option value="C">Type C - Advanced</option>
                  <option value="D">Type D - Expert</option>
                  <option value="Family">Family Variant</option>
                  <option value="Intermediate">Intermediate Variant</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-300">Number of Players</label>
                <select 
                  value={playerCount} 
                  onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-700/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
                >
                  <option value={1}>1 Player (Solo Mode)</option>
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                </select>
              </div>
            </div>
          </div>

          {/* Player Names */}
          <div className="p-6 border-b border-green-500/20">
            <h3 className="text-xl font-semibold mb-4 text-green-300">🎮 Player Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm text-green-300">Player {index + 1}</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    placeholder={`Player ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Sections */}
          <div className="p-6 space-y-8">
            
            {/* Wildlife Scoring */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <span className="text-2xl">🦌</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-400">Wildlife Scoring</h2>
                  <p className="text-amber-300/80">Type {gameType} Wildlife Cards</p>
                </div>
              </div>

              <div className="grid gap-4">
                {wildlifeAnimals.map((animal) => {
                  const scoring = wildlifeScoring[animal.key][gameType] || wildlifeScoring[animal.key]['A'];
                  return (
                    <div key={animal.key} className="bg-slate-700/30 rounded-xl border border-amber-500/20">
                      <div className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{animal.emoji}</span>
                              <h3 className="text-lg font-semibold text-amber-300">{animal.name}</h3>
                              <button
                                onClick={() => toggleHelp(animal.key)}
                                className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                              >
                                <HelpCircle size={16} className="text-amber-400" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-300 mb-1">{scoring.description}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-center">
                            {players.map((player, playerIndex) => (
                              <div key={playerIndex} className="text-center min-w-0">
                                <label className="block text-xs text-gray-400 mb-1 truncate">{player.name}</label>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => adjustScore(playerIndex, animal.key, -1)}
                                    className="p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-amber-500/30 text-amber-400 flex-shrink-0"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={getScore(playerIndex, animal.key)}
                                    onChange={(e) => updateScore(playerIndex, animal.key, e.target.value)}
                                    className={`w-16 p-2 bg-slate-600/50 border rounded-lg text-center text-white focus:ring-2 focus:ring-amber-400 ${
                                      isScoreUnusual(playerIndex, animal.key) ? 'border-red-500 bg-red-900/20' : 'border-amber-500/30'
                                    }`}
                                  />
                                  <button
                                    onClick={() => adjustScore(playerIndex, animal.key, 1)}
                                    className="p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-amber-500/30 text-amber-400 flex-shrink-0"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                {isScoreUnusual(playerIndex, animal.key) && (
                                  <div className="text-xs text-red-400 mt-1">Unusually high!</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Expandable Help */}
                        {expandedHelp[animal.key] && (
                          <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <div className="text-sm text-amber-300 mb-2">
                              <strong>How to Score:</strong> {scoring.helper}
                            </div>
                            <div className="text-xs text-amber-400">
                              <strong>Examples:</strong> {scoring.examples}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-amber-300">Wildlife Subtotal</span>
                  <div className="flex gap-6">
                    {players.map((player, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm text-gray-400">{player.name}</div>
                        <div className="text-2xl font-bold text-amber-400">{calculateWildlifeTotal(index)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Habitat Scoring */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Mountain className="text-green-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400">Habitat Scoring</h2>
                  <p className="text-green-300/80">Corridor sizes & automatic majority bonuses</p>
                </div>
              </div>

              <div className="grid gap-4">
                {habitats.map((habitat) => (
                  <div key={habitat.key} className="bg-slate-700/30 rounded-xl p-4 border border-green-500/20">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{habitat.emoji}</span>
                          <h3 className="text-lg font-semibold text-green-300">{habitat.name}</h3>
                        </div>
                        <p className="text-sm text-gray-300">Enter your largest contiguous corridor size</p>
                        <p className="text-xs text-green-400">Majority bonuses calculated automatically</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {players.map((player, playerIndex) => (
                          <div key={playerIndex} className="text-center min-w-0">
                            <label className="block text-xs text-gray-400 mb-1 truncate">{player.name}</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => adjustScore(playerIndex, `${habitat.key}_corridor`, -1)}
                                className="p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-green-500/30 text-green-400 flex-shrink-0"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={getScore(playerIndex, `${habitat.key}_corridor`)}
                                onChange={(e) => updateScore(playerIndex, `${habitat.key}_corridor`, e.target.value)}
                                className="w-16 p-2 bg-slate-600/50 border border-green-500/30 rounded-lg text-center text-white focus:ring-2 focus:ring-green-400"
                              />
                              <button
                                onClick={() => adjustScore(playerIndex, `${habitat.key}_corridor`, 1)}
                                className="p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-green-500/30 text-green-400 flex-shrink-0"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="text-xs text-green-400 mt-1">
                              +{calculateHabitatMajority(playerIndex, habitat.key)} bonus
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-300">Habitat Subtotal</span>
                  <div className="flex gap-6">
                    {players.map((player, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm text-gray-400">{player.name}</div>
                        <div className="text-2xl font-bold text-green-400">{calculateHabitatTotal(index)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nature Tokens */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <span className="text-2xl">🌰</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Nature Tokens</h2>
                  <p className="text-yellow-300/80">1 point each for unused Douglas Fir cones</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">🌰 Unused Nature Tokens</h3>
                    <p className="text-sm text-gray-300">Count your remaining Douglas Fir cones</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {players.map((player, playerIndex) => (
                      <div key={playerIndex} className="text-center min-w-0">
                        <label className="block text-xs text-gray-400 mb-1 truncate">{player.name}</label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustScore(playerIndex, 'nature_tokens', -1)}
                            className="p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-yellow-500/30 text-yellow-400 flex-shrink-0"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={getScore(playerIndex, 'nature_tokens')}
                            onChange={(e) => updateScore(playerIndex, 'nature_tokens', e.target.value)}
                            className="w-16 p-2 bg-slate-600/50 border border-yellow-500/30 rounded-lg text-center text-white focus:ring-2 focus:ring-yellow-400"
                          />
                          <button
                            onClick={() => adjustScore(playerIndex, 'nature_tokens', 1)}
                            className="p-1 bg-slate-600/50 hover:bg-slate-600/70 rounded border border-yellow-500/30 text-yellow-400 flex-shrink-0"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Final Results */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="text-blue-400" size={32} />
                  <h2 className="text-3xl font-bold text-blue-400">Final Results</h2>
                </div>
                <button
                  onClick={celebrateWinner}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  🎉 Celebrate Winner! 🎉
                </button>
              </div>

              <div className="grid gap-4">
                {getRanking().map((player, rank) => {
                  const category = getScoreCategory(player.score, rank === 0);
                  return (
                    <div key={player.index} className={`p-4 rounded-xl border ${
                      rank === 0 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                        : 'bg-slate-700/30 border-slate-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold ${
                            rank === 0 ? 'text-yellow-400' : 
                            rank === 1 ? 'text-gray-300' : 
                            rank === 2 ? 'text-orange-400' : 'text-gray-400'
                          }`}>
                            {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}th`}
                          </div>
                          <div>
                            <div className={`text-xl font-bold ${rank === 0 ? 'text-yellow-400' : 'text-white'}`}>
                              {player.name}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Nature: {player.nature}</span>
                              <div className={`px-2 py-1 rounded-full text-xs ${category.bg} ${category.color}`}>
                                {category.label}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${rank === 0 ? 'text-yellow-400' : 'text-blue-400'}`}>
                            {player.score}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetAllScores}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-semibold transition-all transform hover:scale-105 shadow-lg mx-auto"
              >
                <RotateCcw size={20} />
                Reset All Scores
              </button>
            </div>
          </div>

          {/* Celebration Modal */}
          {showCelebration && <CelebrationModal />}

          {/* Footer */}
          <div className="p-6 border-t border-green-500/20 text-center">
            <p className="text-green-300 mb-2">🌲 Made with ❤️ for Fe, Zo, Ra, Hu & Nu 🦌</p>
            <p className="text-gray-400 text-sm">Ultimate Cascadia Board Game Calculator | Auto-saves your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CascadiaCalculator;
