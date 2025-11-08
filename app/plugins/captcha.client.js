import { registerCaptcha } from "~/composables/useCaptchaManager";
import CaptchaImages from "~/components/Captcha/Images.vue";
import CaptchaTicTacToe from "~/components/Captcha/TicTacToe.vue";

export default defineNuxtPlugin(() => {
  // Register all captcha types here
  // Usage: registerCaptcha(name, component, weight)
  // Higher weight = more likely to be selected randomly
  
  registerCaptcha("Images", CaptchaImages, 1);
  registerCaptcha("TicTacToe", CaptchaTicTacToe, 1);
  
  // To add a new captcha:
  // 1. Import the component above
  // 2. Call registerCaptcha with a unique name
  // 3. That's it! The captcha will automatically be available
  
  // Example for future captchas:
  // import CaptchaMathProblem from "~/components/Captcha/MathProblem.vue";
  // registerCaptcha("MathProblem", CaptchaMathProblem, 2); // 2x more likely than others
});
