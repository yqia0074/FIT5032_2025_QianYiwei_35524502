<template>
  <div class="self-help-tools">
    <div class="tools-header mb-4">
      <h3>Self-Help Toolkit</h3>
      <p class="text-muted">These tools can help you manage emotions, reduce stress, and improve mental health</p>
    </div>
    
    <div class="row g-4">
      <!-- Mood diary tool -->
      <div class="col-md-12">
        <div class="card tool-card">
          <div class="card-body">
            <MoodDiary />
          </div>
        </div>
      </div>
      
      <!-- Meditation tool -->
      <div class="col-md-6">
        <div class="card tool-card meditation-card">
          <div class="card-body">
            <h4>
              <i class="bi bi-music-note-beamed"></i>
              Meditation Practice
            </h4>
            <p>Reduce stress and improve focus through guided meditation</p>
            <div class="meditation-controls">
              <audio ref="audioPlayer" src="/src/assets/sample-audio.mp3" class="w-100 mb-2"></audio>
              <div class="d-flex justify-content-between">
                <button @click="playAudio" class="btn btn-primary">
                  <i class="bi" :class="isPlaying ? 'bi-pause-fill' : 'bi-play-fill'"></i>
                  {{ isPlaying ? 'Pause' : 'Play' }}
                </button>
                <button @click="resetAudio" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-counterclockwise"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Breathing exercise tool -->
      <div class="col-md-6">
        <div class="card tool-card breathing-card">
          <div class="card-body">
            <h4>
              <i class="bi bi-wind"></i>
              Breathing Exercise
            </h4>
            <p>Follow the animation for deep breathing to help relax your body and mind</p>
            
            <div class="breathing-exercise text-center">
              <div class="breathing-circle" :class="{'breathe-in': breathingState === 'in', 'hold-breath': breathingState === 'hold', 'breathe-out': breathingState === 'out'}">
                <div class="breathing-text">
                  {{ breathingText }}
                </div>
              </div>
              
              <button @click="toggleBreathingExercise" class="btn mt-3" :class="isBreathingActive ? 'btn-danger' : 'btn-success'">
                <i class="bi" :class="isBreathingActive ? 'bi-stop-fill' : 'bi-play-fill'"></i>
                {{ isBreathingActive ? 'Stop Exercise' : 'Start Exercise' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Positive thinking tool -->
      <div class="col-md-12">
        <div class="card tool-card positive-thinking-card">
          <div class="card-body">
            <h4>
              <i class="bi bi-lightbulb-fill"></i>
              Positive Thinking Exercise
            </h4>
            <p>Simple exercises to transform negative thoughts into positive thinking</p>
            
            <div class="positive-thinking-exercise">
              <div class="form-group mb-3">
                <label for="negativeThought">Write down a negative thought:</label>
                <textarea id="negativeThought" v-model="negativeThought" class="form-control" rows="2" placeholder="For example: I can never do this right..."></textarea>
              </div>
              
              <div class="form-group mb-3">
                <label for="positiveThought">Now, transform it into a positive statement:</label>
                <textarea id="positiveThought" v-model="positiveThought" class="form-control" rows="2" placeholder="For example: Although this is challenging, I will do my best and improve a little each time..."></textarea>
              </div>
              
              <button @click="savePositiveThinking" class="btn btn-success" :disabled="!negativeThought || !positiveThought">
                <i class="bi bi-journal-check"></i>
                Save Exercise
              </button>
              
              <div v-if="positiveThinkingHistory.length > 0" class="mt-4">
                <h5>Your Positive Thinking Records:</h5>
                <div class="list-group">
                  <div v-for="(item, index) in positiveThinkingHistory" :key="index" class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                      <small class="text-muted">{{ formatDate(item.date) }}</small>
                    </div>
                    <p class="mb-1"><strong>Negative Thought:</strong> {{ item.negative }}</p>
                    <p class="mb-0 text-success"><strong>Positive Transformation:</strong> {{ item.positive }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MoodDiary from './MoodDiary.vue'

// Meditation audio control
const audioPlayer = ref(null)
const isPlaying = ref(false)

function playAudio() {
  if (audioPlayer.value) {
    if (isPlaying.value) {
      audioPlayer.value.pause()
    } else {
      audioPlayer.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

function resetAudio() {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    isPlaying.value = false
  }
}

// Breathing exercise
const breathingState = ref('ready') // ready, in, hold, out
const isBreathingActive = ref(false)
let breathingInterval = null

const breathingText = computed(() => {
  const textMap = {
    'ready': 'Ready',
    'in': 'Inhale',
    'hold': 'Hold',
    'out': 'Exhale'
  }
  return textMap[breathingState.value]
})

function toggleBreathingExercise() {
  if (isBreathingActive.value) {
    stopBreathingExercise()
  } else {
    startBreathingExercise()
  }
}

function startBreathingExercise() {
  isBreathingActive.value = true
  let cycle = 0
  
  function runCycle() {
    // Inhale for 4 seconds
    breathingState.value = 'in'
    setTimeout(() => {
      if (!isBreathingActive.value) return
      
      // Hold for 4 seconds
      breathingState.value = 'hold'
      setTimeout(() => {
        if (!isBreathingActive.value) return
        
        // Exhale for 6 seconds
        breathingState.value = 'out'
        setTimeout(() => {
          if (!isBreathingActive.value) return
          
          cycle++
          if (isBreathingActive.value) {
            runCycle()
          }
        }, 6000) // Exhale time
      }, 4000) // Hold time
    }, 4000) // Inhale time
  }
  
  runCycle()
}

function stopBreathingExercise() {
  isBreathingActive.value = false
  breathingState.value = 'ready'
}

// Positive thinking exercise
const negativeThought = ref('')
const positiveThought = ref('')
const positiveThinkingHistory = ref([])

function savePositiveThinking() {
  if (!negativeThought.value || !positiveThought.value) return
  
  const entry = {
    negative: negativeThought.value,
    positive: positiveThought.value,
    date: new Date().toISOString()
  }
  
  positiveThinkingHistory.value.unshift(entry)
  localStorage.setItem('positiveThinking', JSON.stringify(positiveThinkingHistory.value))
  
  // Clear inputs
  negativeThought.value = ''
  positiveThought.value = ''
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  // Load positive thinking history
  const saved = localStorage.getItem('positiveThinking')
  if (saved) {
    try {
      positiveThinkingHistory.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse positive thinking history', e)
    }
  }
  
  // Audio playback ended event
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }
})
</script>

<style scoped>
.self-help-tools {
  padding: 10px;
}

.tool-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  height: 100%;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.meditation-card {
  background-color: #e8f5e9;
  border-left: 5px solid #4caf50;
}

.breathing-card {
  background-color: #e3f2fd;
  border-left: 5px solid #2196f3;
}

.positive-thinking-card {
  background-color: #fff8e1;
  border-left: 5px solid #ffc107;
}

.breathing-exercise {
  padding: 20px 0;
}

.breathing-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #bbdefb;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 1s ease, background-color 1s ease;
  position: relative;
}

.breathing-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1565c0;
}

.breathe-in {
  transform: scale(1.5);
  background-color: #90caf9;
}

.hold-breath {
  transform: scale(1.5);
  background-color: #64b5f6;
}

.breathe-out {
  transform: scale(1);
  background-color: #bbdefb;
}
</style>

