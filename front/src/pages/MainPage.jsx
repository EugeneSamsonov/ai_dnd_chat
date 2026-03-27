const MainPage =() => {
  return (
    <h1>Hello, World!</h1>
  );
}

export default MainPage;

// import { useState } from "react";

// function BlogCard({ image_url, title }) {
//   const [likes, setLikes] = useState(0);

//   function addLike() {
//     setLikes(likes + 1);
//   }

//   return (
//     <div className="card">
//       <img
//         src={ image_url }
//         alt="Случайный котик"
//         className="card-image"
//       />
//       <div className="card-text">
//       <h2>{ title }</h2>
//         <p>Лайков: { likes }</p>
//         <div className="buttons">
//             <button className="like-button" onClick={addLike}>
//                 <img className="like-icon" src="https://png.klev.club/uploads/posts/2024-04/png-klev-club-zgr7-p-serdtse-laik-png-9.png" alt="" />
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BlogCard;
