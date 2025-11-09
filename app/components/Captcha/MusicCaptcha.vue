<template>
  <ClientOnly>
    <PopupElement
            title="Orchestra"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="400"
        >
        <!-- Instructions -->
        <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <span class="text-lg font-bold text-blue-600">Select all the musicians needed to make the beautiful music you are hearing.</span>
        </div>
        <div class="flex items-center justify-center">
            <div class="grid grid-cols-3 place-items-center border-2">
                <div class="flex flex-col items-center gap-2">
                  <button @click="bass_pressed"
                    class="bass cursor-pointer scale-[0.3]"
                    :class="{ dancing: isDancing }"
                  >
                  </button>
                  <span class="text-black">{{bass_bool ? "Present" : "Absent"}}</span>
                </div>

                <div class="flex flex-col items-center gap-2">
                  <button @click="cor_pressed"
                          class="cor cursor-pointer scale-[0.3]"
                          :class="{ dancing: isDancing }"
                          >
                  </button>
                  <span class="text-black">{{cor_bool ? "Present" : "Absent"}}</span>
                </div>
                
                <div class="flex flex-col items-center gap-2">
                  <button @click="drum_pressed"
                          class="drum cursor-pointer scale-[0.3]"
                          :class="{ dancing: isDancing }"
                          >
                  </button>
                  <span class="text-black">{{drum_bool ? "Present" : "Absent"}}</span>
                </div>

                <div class="flex flex-col items-center gap-2">
                  <button @click="trumpet_pressed"
                          class="trumpet cursor-pointer scale-[0.3]"
                          :class="{ dancing: isDancing }"
                          >
                  </button>
                  <span class="text-black">{{trumpet_bool ? "Present" : "Absent"}}</span>
                </div>

                <div class="flex flex-col items-center gap-2">
                  <button @click="wind_pressed"
                          class="wind cursor-pointer scale-[0.3]"
                          :class="{ dancing: isDancing }"
                          >
                  </button>
                  <span class="text-black">{{wind_bool ? "Present" : "Absent"}}</span>
                </div>

                <div class="flex flex-col items-center gap-2">
                  <button @click="xylo_pressed"
                          class="xylo cursor-pointer scale-[0.3]"
                          :class="{ dancing: isDancing }"
                          >
                  </button>
                  <span class="text-black">{{xylo_bool ? "Present" : "Absent"}}</span>
                </div>
            </div>
        </div>

        <div class="flex gap-3 justify-end">
            <!-- Feedback Message -->
            <div v-if="feedbackMessage" class="w-full px-4 py-2 rounded" :class="feedbackClass">
                {{ feedbackMessage }}
            </div>

            <button
                @click="verifyCaptcha"
                :disabled="isVerifying"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
            >
                {{ isVerifying ? "Verifying..." : "Verify" }}
            </button>
        </div>
        
        <audio loop autoplay style="display: none;">
            <source src="/captcha/music/bass_2.mp3" type="audio/mpeg">
        </audio>
        <audio loop autoplay style="display: none;">
            <source src="/captcha/music/drum_2.mp3" type="audio/mpeg">
        </audio>
        <audio loop autoplay style="display: none;">
            <source src="/captcha/music/flute_2.mp3" type="audio/mpeg">
        </audio>
      </PopupElement>
    </ClientOnly>
</template>

<script setup>
    import { ref, onMounted } from "vue";

    const emit = defineEmits(["verified", "closed", "hide", "spawnNew"]);

    const props = defineProps({
        popupId: {
            type: Number,
            required: true,
        },
    });

    const isOpen = ref(false);

    const isVerifying = ref(false);
    const feedbackClass = ref("");
    const feedbackMessage = ref("");
    const isDancing = true;
    const bass_bool = ref(false);
    const cor_bool = ref(false);
    const drum_bool = ref(false);
    const trumpet_bool = ref(false);
    const wind_bool = ref(false);
    const xylo_bool = ref(false);

    onMounted(() => {
        start()
    })

    function start() {
        /*var audio = new Audio("/captcha/music/bass_2.mp3");
        
        audio.play();*/
        
    }

    function bass_pressed() {
        bass_bool.value = !bass_bool.value
    }

    function cor_pressed() {
        cor_bool.value = !cor_bool.value
    }

    function drum_pressed() {
        drum_bool.value = !drum_bool.value
    }

    function trumpet_pressed() {
        trumpet_bool.value = !trumpet_bool.value
    }

    function wind_pressed() {
        wind_bool.value = !wind_bool.value
    }

    function xylo_pressed() {
        xylo_bool.value = !xylo_bool.value
    }

    const handleClose = () => {
      emit("closed", props.popupId);
      isOpen.value = false;
    };

    const handleHide = () => {
        isOpen.value = false;
        emit("hide", props.popupId);
    };

    const openCaptcha = () => {
        // Reset/initialize your captcha
        isOpen.value = true;
    };

    const showCaptcha = () => {
        isOpen.value = true;
    };

    const verifyCaptcha = async () => {
      isVerifying.value = true;

      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (bass_bool.value && drum_bool.value && wind_bool.value
        && !trumpet_bool.value && !xylo_bool.value && !cor_bool.value
      ) {
          feedbackMessage.value = "Correct!";
          feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
          setTimeout(() => {
              emit("verified", props.popupId);
              handleClose();
          }, 1500);
      } else {
          feedbackMessage.value = "One of the musician is quite discreet, try again.";
          feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
          bass_bool.value = false
          drum_bool.value = false
          wind_bool.value = false
          trumpet_bool.value = false
          xylo_bool.value = false
          cor_bool.value = false
          
           await new Promise((resolve) => setTimeout(resolve, 500));
      }

    isVerifying.value = false;
  };

    // REQUIRED: Expose these methods
    defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>

<style scoped>
.bass {
  position: flex;
  width: 256px;
  height: 256px;
  background-image: url('/captcha/music/bass.png');
  background-repeat: no-repeat;
  background-size: 1024px 256px;
  pointer-events: auto;
  transition: transform 0.1s;
}

.bass.dancing {
  animation: dance 0.6s steps(4) infinite;
}

@keyframes dance {
  from { background-position: 0px 0px; }
  to { background-position: -1024px 0px; }
}

.cor {
  position: flex;
  width: 256px;
  height: 256px;
  background-image: url('/captcha/music/cor.png');
  background-repeat: no-repeat;
  background-size: 1024px 256px;
  pointer-events: auto;
  transition: transform 0.1s;
}

.cor.dancing {
  animation: dance 0.6s steps(4) infinite;
}

.drum {
  position: flex;
  width: 256px;
  height: 256px;
  background-image: url('/captcha/music/drum.png');
  background-repeat: no-repeat;
  background-size: 1024px 256px;
  pointer-events: auto;
  transition: transform 0.1s;
}

.drum.dancing {
  animation: dance 0.6s steps(4) infinite;
}

.trumpet {
  position: flex;
  width: 256px;
  height: 256px;
  background-image: url('/captcha/music/trumpet.png');
  background-repeat: no-repeat;
  background-size: 1024px 256px;
  pointer-events: auto;
  transition: transform 0.1s;
}

.trumpet.dancing {
  animation: dance 0.6s steps(4) infinite;
}

.wind {
  position: flex;
  width: 256px;
  height: 256px;
  background-image: url('/captcha/music/wind.png');
  background-repeat: no-repeat;
  background-size: 1024px 256px;
  pointer-events: auto;
  transition: transform 0.1s;
}

.wind.dancing {
  animation: dance 0.6s steps(4) infinite;
}

.xylo {
  position: flex;
  width: 256px;
  height: 256px;
  background-image: url('/captcha/music/xylo.png');
  background-repeat: no-repeat;
  background-size: 1024px 256px;
  pointer-events: auto;
  transition: transform 0.1s;
}

.xylo.dancing {
  animation: dance 0.6s steps(4) infinite;
}
</style>