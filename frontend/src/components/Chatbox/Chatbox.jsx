import assets from "../../assets";
import "./Chatbox.css";
export const Chatbox = () => {
  return (
    <div>
      <div className="chat-box">
        <div className="chat-user">
          <img src={assets.profile_img} alt="" srcSet="" />
          <p>
            Het Khunt<img src={assets.green_dot} className="dot"></img>
          </p>
          <img src={assets.help_icon} alt="" srcSet="" className="help" />
        </div>
        <div className="chat-msg">
          <div className="s-msg">
            <p className="msg">Lorem ipsum dolor sit amet.</p>
            <div>
              <img src={assets.profile_img} alt="" srcSet="" />
              <p>2:30 PM</p>
            </div>
          </div>

          <div className="s-msg">
            <img className="msg-img" src={assets.pic1} alt="" srcSet="" />
            <div>
              <img src={assets.profile_img} alt="" srcSet="" />
              <p>2:30 PM</p>
            </div>
          </div>

          <div className="r-msg">
            <p className="msg">Lorem ipsum dolor sit amet.</p>
            <div>
              <img src={assets.profile_img} alt="" srcSet="" />
              <p>2:30 PM</p>
            </div>
          </div>
        </div>
        <div className="chat-input">
          <input type="text" placeholder="send a message" />
          <input
            type="file"
            name=""
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" srcSet="" />
          </label>
          <img src={assets.send_button} alt="" srcSet="" />
        </div>
      </div>
    </div>
  );
};
