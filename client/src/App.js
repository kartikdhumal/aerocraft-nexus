import '../src/input.css'
import Result from './components/Result';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
       <Result/>
       <ToastContainer />
    </div>
  );
}

export default App;
