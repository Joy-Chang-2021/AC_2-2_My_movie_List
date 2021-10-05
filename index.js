//API
const base_url = "https://movie-list.alphacamp.io";
const index_url = base_url + "/api/v1/movies/";
const poster_url = base_url + "/posters/";
//movie panel
const dataPanel = document.querySelector("#data-panel");
const movies = [];
//display mode
const displayModePanel = document.querySelector("#display-mode");
let currentMode = "card"; //defult
//Search function
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let filteredMovies = [];
//Paginator
const paginator = document.querySelector("#paginator");
const movies_per_page = 12;
let page = 1;

//取得API資料
axios
  .get(index_url)
  .then((response) => {
    movies.push(...response.data.results);
    renderPanelByCard(getMoviesByPage());
    renderPaginator();
  })
  .catch((err) => console.log(err));

// 監聽器：查看電影資訊：modal ＆ 加入收藏清單
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(id);
  }
});

// 監聽器：搜尋關鍵字
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault(); //使瀏覽器停止預設行為、交給JS來控制
  const keyword = searchInput.value.trim().toLowerCase(); //變成小寫

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  // 若找不到含有關鍵字的電影名稱
  if (filteredMovies.length === 0)
    alert("Cannot find movie with this keyword: " + keyword);

  //使用搜尋功能後，使分頁按鈕都從1開始
  page = 1;
  renderPaginator();

  //判斷面板觀看模式、再加以渲染
  if (currentMode === "list") renderPanelByList(getMoviesByPage());
  else renderPanelByCard(getMoviesByPage());
});

// 監聽器：當點擊按鈕的超連結元素，讀取按鈕的編號
// 代入函式：從頁數切出所需的電影清單 → 顯示電影面板
paginator.addEventListener("click", function onPaginatorClicked(event) {
  // 確保點擊在按鈕超連結上才執行函式動作
  if (event.target.tagName !== "A") return;
  // 讀取按鈕的編號
  page = Number(event.target.dataset.page);
  renderPaginator();
  // 區別當下的觀看模式、使跳轉頁面時可維持相同的觀看模式
  if (currentMode === "list") renderPanelByList(getMoviesByPage());
  else renderPanelByCard(getMoviesByPage());
});

//監聽器：切換觀看模式、且要跳轉到指定頁碼的清單中
displayModePanel.addEventListener(
  "click",
  function onDisplayModeClicked(event) {
    if (event.target.matches(".card-mode")) {
      currentMode = "card";
      renderPanelByCard(getMoviesByPage());
    }
    if (event.target.matches(".list-mode")) {
      currentMode = "list";
      renderPanelByList(getMoviesByPage());
    }
  }
);

// 新增函式：將面板渲染為清單模式
function renderPanelByList(data) {
  let rawHTML = '<ul class="list-group list-group-flush w-100">';

  data.forEach((item) => {
    rawHTML += `
  <li class="list-group-item list-group-item-action d-flex flex-row justify-content-between">
    <h5 class="card-title">${item.title}</h5>
    <div>
      <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
      <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
    </div>
  </li>
  `;
  });
  rawHTML += "</ul>";

  dataPanel.innerHTML = rawHTML;
}

// 函式：將面板渲染為卡片模式
function renderPanelByCard(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${poster_url + item.image}"
              class="card-img-top" alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  });

  dataPanel.innerHTML = rawHTML;
}

// 函式：查看電影資訊 Modal
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(index_url + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${poster_url + data.image
      } " alt="movie-poster" class="img-fluid">`;
  });
}

// 函式：加入收藏清單
function addToFavorite(id) {
  //想要取用localStorage，若無(localStorage→false)，則取用空陣列
  const Storage = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  //some只判斷true&false
  if (Storage.some((movie) => movie.id === id)) {
    return alert("此電影已在收藏清單中");
  }

  Storage.push(movie);

  localStorage.setItem("favoriteMovies", JSON.stringify(Storage));
}

//函式：選取分頁、取得所需電影清單（從movies陣列中切出頁數內要呈現的電影清單）
function getMoviesByPage() {
  const items = filteredMovies.length ? filteredMovies : movies;

  const startIndex = (page - 1) * movies_per_page;
  return items.slice(startIndex, startIndex + movies_per_page);
}

//函式：計算電影數量並製造所需的分頁按鈕
function renderPaginator() {
  const amount = filteredMovies.length ? filteredMovies.length : movies.length;
  const numbersOfPages = Math.ceil(amount / movies_per_page);

  let rowHTML = "";

  for (let i = 1; i <= numbersOfPages; i++) {
    if (i === page) {
      rowHTML += `<li class="page-item active"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    } else {
      rowHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
  }
  paginator.innerHTML = rowHTML;
}