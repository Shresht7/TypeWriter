import TypeWriter from "./TypeWriter";
import "./styles.css";

new TypeWriter(document.body, {
  loop: true
})
  .write("Hello\n\n")
  .pause(1000)
  .eraseAll()
  .write("My name is Shzre")
  .erase(3)
  .write("hresht")
  .pause(5000)
  .eraseAll()
  .start();
