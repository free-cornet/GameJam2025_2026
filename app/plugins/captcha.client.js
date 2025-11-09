import { registerCaptcha } from "~/composables/useCaptchaManager";
import CaptchaImages from "~/components/Captcha/Images.vue";
import CaptchaTicTacToe from "~/components/Captcha/TicTacToe.vue";
import CaptchaText from "~/components/Captcha/TextCaptcha.vue";
import CaptchaNotARobot from "~/components/Captcha/NotARobot.vue";
import DinoCaptcha from "~/components/Captcha/DinoCaptcha.vue";
import QuestionCaptcha from "~/components/Captcha/QuestionCaptcha.vue";
import DragCaptcha  from "~/components/Captcha/DragCaptcha.vue";
import MusicCaptcha from "~/components/Captcha/MusicCaptcha.vue";
import SpotOddOneCaptcha from "~/components/Captcha/SpotOddOneCaptcha.vue";

export default defineNuxtPlugin(() => {
  // Register all captcha types here
  // Usage: registerCaptcha(name, component, weight)
  // Higher weight = more likely to be selected randomly
  
  registerCaptcha("Images", CaptchaImages, 7);
  registerCaptcha("TicTacToe", CaptchaTicTacToe, 1);
  registerCaptcha("TextCaptcha", CaptchaText, 3);
  registerCaptcha("NotARobot", CaptchaNotARobot, 1);
  registerCaptcha("DinoCaptcha", DinoCaptcha, 1);
  registerCaptcha("QuestionCaptcha", QuestionCaptcha, 1);
  registerCaptcha("DragCaptcha", DragCaptcha, 2);
  registerCaptcha("QuestionCaptcha", QuestionCaptcha, 2);
  registerCaptcha("MusicCaptcha", MusicCaptcha, 1)
  registerCaptcha("QuestionCaptcha", QuestionCaptcha, 10);
  registerCaptcha("SpotOddOne", SpotOddOneCaptcha, 1);
  
  // To add a new captcha:
  // 1. Import the component above
  // 2. Call registerCaptcha with a unique name
  // 3. That's it! The captcha will automatically be available
  
  // Example for future captchas:
  // import CaptchaMathProblem from "~/components/Captcha/MathProblem.vue";
  // registerCaptcha("MathProblem", CaptchaMathProblem, 2); // 2x more likely than others
});
