import { registerCaptcha } from "~/composables/useCaptchaManager";
import CaptchaImages from "~/components/Captcha/Images.vue";
import CaptchaTicTacToe from "~/components/Captcha/TicTacToe.vue";
import CaptchaText from "~/components/Captcha/TextCaptcha.vue";
import CaptchaNotARobot from "~/components/Captcha/NotARobot.vue";
import DinoCaptcha from "~/components/Captcha/DinoCaptcha.vue";

export default defineNuxtPlugin(() => {
  // Register all captcha types here
  // Usage: registerCaptcha(name, component, weight)
  // Higher weight = more likely to be selected randomly
  
  registerCaptcha("Images", CaptchaImages, 3);
  registerCaptcha("TicTacToe", CaptchaTicTacToe, 1);
  registerCaptcha("TextCaptcha", CaptchaText, 2);
  registerCaptcha("NotARobot", CaptchaNotARobot, 2);
  registerCaptcha("DinoCaptcha", DinoCaptcha, 1);
  
  // To add a new captcha:
  // 1. Import the component above
  // 2. Call registerCaptcha with a unique name
  // 3. That's it! The captcha will automatically be available
  
  // Example for future captchas:
  // import CaptchaMathProblem from "~/components/Captcha/MathProblem.vue";
  // registerCaptcha("MathProblem", CaptchaMathProblem, 2); // 2x more likely than others
});
