import MainApp from "./MainApp";
import "./style.css";

const application = new MainApp(document.querySelector(".main") as HTMLElement);
application.start();
