// GoTop 按鈕
// ============================================================

var goTopButton = $('#goTop');

goTopButton.click(function () {
  /* 點擊 .go-top-btn 滾動至 body 頂端 */
  $('html,body').animate({
    scrollTop: 0
  }, 800);
});

$(window).on('scroll resize reload', function () {
  /* 當視窗滾動的時候 */
  if ($(window).scrollTop() > $(window).height()) {
    /* 如果視窗距離頂部的距離大於視窗的高度，則 backButton 顯示 */
    goTopButton.show();
  } else {
    /* 否則淡出 */
    goTopButton.fadeOut();
  }
});


// ============================================================
// 區塊錨點選單
// ============================================================

let scrollTarget = $('.scroll-target');
let scrollItem = $('.scroll-target').children('section'); // 改 children
let menuHeight = $('.menu-height').outerHeight();

console.log(`nav高: ${menuHeight}px`);

scrollItem.each(function () {

  let _this = $(this);

  $(window).on('scroll resize reload', function () {

    let scrollItemT = _this.offset().top,
      scrollTargetT = scrollTarget.offset().top,
      scrollTargetH = scrollTarget.outerHeight(),
      windowH = $(window).scrollTop(),
      thisIndex = _this.index();

    console.log(`main距頂: ${scrollTargetT} px`);
    console.log(`windowH距頂${windowH}px`);

    // console.log(`第${thisIndex}個距頂${scrollItemT - windowH}px`);

    if ((scrollTargetT - menuHeight) > windowH) {
      $('.scroll-tag').find('li').removeClass('on');
    }

    if (scrollItemT - windowH - 5 <= menuHeight) {
      $('.scroll-tag').find('li').removeClass('on');
      $('.scroll-tag').find('li').eq(thisIndex).addClass('on');
    }

  });

});


$('.scroll-tag').find('li').click(function () {

  let clickNum = $(this).index();

  // console.log(`點擊的li序號${clickNum}`);

  let menuHeight = $('.menu-height').outerHeight(),
    targets = $('.scroll-target').children('section'); // 改 children

  // 切換點擊或滑動的 li
  $('.scroll-tag').find('.section').removeClass('on');
  $(this).addClass('on');

  // 找相對應的區塊
  console.log(`nav高度${menuHeight}`);

  $('html,body').stop().animate({
    scrollTop: targets.eq(clickNum).offset().top - menuHeight
  }, 800);

});


// ============================================================
// Banner
// ============================================================


// ============================================================
// 票券優惠篩選
//
// 不改原本行程 HTML 結構
//
// 優惠類型：
// limited = 限量促銷／指定日期／付訂／固定金額優惠
// second  = 第二人優惠
// upgrade = 升等／艙等升等
//
// 如果 HTML 本身已有：
// data-offer-type="limited"
// data-offer-type="second"
// data-offer-type="upgrade"
//
// 則優先使用 HTML 指定的類型。
// 沒有指定才會依 .discount 文字自動判斷。
// ============================================================

$(function () {

  var $tickets = $('.ticket-filter');

  var $tourItems = $('.itf-box-bg .label-pt > ul > li');


  if (!$tickets.length || !$tourItems.length) {
    return;
  }


  // ============================================================
  // 自動判斷優惠類型
  // ============================================================

  function getFilterType($item) {

    var text = $.trim(
      $item.find('.discount').text()
    ).replace(/\s+/g, '');


    // 第二人優惠
    if (/第二人|兩人同行|2人同行|二人同行/.test(text)) {
      return 'second';
    }


    // 升等／艙等升等
    if (/升等|升艙|艙等/.test(text)) {
      return 'upgrade';
    }


    // 限量／指定日期／付訂／固定金額優惠
    if (
      /限量|指定出發|付訂|旅展期間|優惠[0-9０-９,，]+元|優惠.*元/.test(text)
    ) {
      return 'limited';
    }


    // 無法判斷時，預設歸類為 limited
    return 'limited';
  }


  // ============================================================
  // 設定每個行程的優惠類型
  //
  // HTML 有 data-offer-type：
  // → 優先使用 HTML
  //
  // HTML 沒有：
  // → 自動從 .discount 判斷
  // ============================================================

  function setItemType() {

    $tourItems.each(function () {

      var $item = $(this);

      var manualType = $item.attr('data-offer-type');


      // --------------------------------------------------------
      // 如果 HTML 已經指定優惠類型
      // 就不要重新覆蓋
      // --------------------------------------------------------

      if (manualType) {
        return;
      }


      // --------------------------------------------------------
      // 沒有指定才自動判斷
      // --------------------------------------------------------

      $item.attr(
        'data-offer-type',
        getFilterType($item)
      );

    });

  }


  // ============================================================
  // 更新各 Session 顯示狀態
  //
  // 原本只判斷：
  // session1
  // session2
  // session3
  //
  // 現在改成自動抓：
  // session1
  // session2
  // session3
  // session4
  // 之後如果新增 session5、session6 也可以直接使用。
  // ============================================================

  function updateSessions() {

    $('.itf-box-bg [id^="session"]').each(function () {

      var $session = $(this);

      var visibleCount = $session
        .find('.label-pt > ul > li:not(.tour-filter-hidden)')
        .length;


      // 如果這個 Session 沒有任何符合優惠類型的行程
      // 就整個隱藏
      $session.toggleClass(
        'session-filter-hidden',
        visibleCount === 0
      );

    });

  }


  // ============================================================
  // 套用票券篩選
  // ============================================================

  function applyFilter(type) {

    $tourItems.each(function () {

      var $item = $(this);

      var match =
        $item.attr('data-offer-type') === type;


      // 不符合的行程隱藏
      $item.toggleClass(
        'tour-filter-hidden',
        !match
      );

    });


    // 更新 Session 顯示狀態
    updateSessions();


    // 更新票券按鈕 active 狀態
    $tickets.each(function () {

      var $ticket = $(this);

      var active =
        $ticket.attr('data-filter') === type;


      $ticket.toggleClass(
        'is-active',
        active
      );


      $ticket.attr(
        'aria-pressed',
        active ? 'true' : 'false'
      );

    });


    // --------------------------------------------------------
    // 篩選後回到內容區上方
    // 避免使用者停在被隱藏的行程位置
    // --------------------------------------------------------

    var $content = $('.itf-box-bg');


    if ($content.length) {

      var navHeight =
        $('.menu-height').outerHeight() || 0;


      $('html, body').stop(true).animate({

        scrollTop: Math.max(
          0,
          $content.offset().top -
          navHeight -
          15
        )

      }, 450);

    }

  }


  // ============================================================
  // 初始化行程優惠類型
  // ============================================================

  setItemType();


  // ============================================================
  // 初始不篩選
  //
  // 維持原本頁面所有行程都顯示
  // ============================================================

  $tickets.attr(
    'aria-pressed',
    'false'
  );


  // ============================================================
  // 票券點擊
  // ============================================================

  function ticketClick() {

    var type =
      $(this).attr('data-filter');


    if (!type) {
      return;
    }


    applyFilter(type);

  }


  $tickets.on(
    'click',
    ticketClick
  );


  // ============================================================
  // 支援鍵盤 Enter / Space
  // ============================================================

  $tickets.on(
    'keydown',
    function (e) {

      if (
        e.key === 'Enter' ||
        e.key === ' '
      ) {

        e.preventDefault();

        ticketClick.call(
          this,
          e
        );

      }

    }
  );


  // ============================================================
  // 手機版票券輪播
  //
  // 原本手機版：
  // 3 張票券左右滑動
  // 點點
  // 自動輪播
  //
  // 點選票券後仍可正常篩選
  // 不改原本排列方式
  // ============================================================

  var ticketList =
    document.querySelector('.ticket-list');

  var tickets =
    document.querySelectorAll(
      '.ticket-list .ticket'
    );


  if (
    !ticketList ||
    tickets.length <= 2
  ) {
    return;
  }


  var currentIndex = 0;

  var autoPlay = null;


  // ============================================================
  // 判斷是否為手機
  // ============================================================

  var isMobile = function () {

    return window.innerWidth <= 767.98;

  };


  // ============================================================
  // 建立手機版輪播點點
  // ============================================================

  var dotsContainer =
    document.createElement('div');

  dotsContainer.className =
    'ticket-dots';


  dotsContainer.innerHTML =
    '<button type="button" class="ticket-dot active" data-index="0" aria-label="第1組票券"></button>' +
    '<button type="button" class="ticket-dot" data-index="1" aria-label="第2組票券"></button>';


  ticketList.parentNode.insertBefore(
    dotsContainer,
    ticketList.nextSibling
  );


  var dots =
    dotsContainer.querySelectorAll(
      '.ticket-dot'
    );


  // ============================================================
  // 更新輪播點點
  // ============================================================

  function updateDots(index) {

    if (!isMobile()) {
      return;
    }


    var dotIndex =
      Math.min(index, 1);


    dots.forEach(function (dot, i) {

      dot.classList.toggle(
        'active',
        i === dotIndex
      );

    });

  }


  // ============================================================
  // 滑動至指定票券
  // ============================================================

  function slideTo(index) {

    if (!isMobile()) {
      return;
    }


    var ticket =
      tickets[index];


    if (!ticket) {
      return;
    }


    ticketList.scrollTo({

      left:
        ticket.offsetLeft -
        ticketList.offsetLeft,

      behavior: 'smooth'

    });


    currentIndex = index;


    updateDots(index);

  }


  // ============================================================
  // 停止自動輪播
  // ============================================================

  function stopAutoPlay() {

    if (autoPlay) {

      clearInterval(
        autoPlay
      );

      autoPlay = null;

    }

  }


  // ============================================================
  // 開始自動輪播
  // ============================================================

  function startAutoPlay() {

    if (!isMobile()) {
      return;
    }


    stopAutoPlay();


    autoPlay =
      setInterval(function () {

        currentIndex++;


        if (
          currentIndex >=
          tickets.length
        ) {

          currentIndex = 0;

        }


        slideTo(
          currentIndex
        );

      }, 3500);

  }


  // ============================================================
  // 點擊輪播點
  // ============================================================

  dots.forEach(function (dot) {

    dot.addEventListener(
      'click',
      function () {

        if (!isMobile()) {
          return;
        }


        var index =
          parseInt(
            this.getAttribute(
              'data-index'
            ),
            10
          );


        stopAutoPlay();


        // 第 1 組 → 第 1 張
        // 第 2 組 → 第 3 張
        slideTo(
          index === 0
            ? 0
            : 2
        );


        startAutoPlay();

      }
    );

  });


  // ============================================================
  // 手機 Touch 滑動
  // ============================================================

  var touchStartX = 0;

  var touchEndX = 0;


  ticketList.addEventListener(
    'touchstart',
    function (e) {

      if (!isMobile()) {
        return;
      }


      touchStartX =
        e.touches[0].clientX;


      stopAutoPlay();

    },
    {
      passive: true
    }
  );


  ticketList.addEventListener(
    'touchend',
    function (e) {

      if (!isMobile()) {
        return;
      }


      touchEndX =
        e.changedTouches[0].clientX;


      var distance =
        touchStartX -
        touchEndX;


      // 左滑
      if (distance > 40) {

        currentIndex++;


        if (
          currentIndex >=
          tickets.length
        ) {

          currentIndex = 0;

        }


        slideTo(
          currentIndex
        );

      }


      // 右滑
      else if (distance < -40) {

        currentIndex--;


        if (currentIndex < 0) {

          currentIndex =
            tickets.length - 1;

        }


        slideTo(
          currentIndex
        );

      }


      startAutoPlay();

    },
    {
      passive: true
    }
  );


  // ============================================================
  // 視窗尺寸變更
  // ============================================================

  window.addEventListener(
    'resize',
    function () {

      if (isMobile()) {

        startAutoPlay();

      } else {

        stopAutoPlay();


        ticketList.scrollTo({

          left: 0,

          behavior: 'auto'

        });


        currentIndex = 0;


        updateDots(0);

      }

    }
  );


  // ============================================================
  // 初始化
  // ============================================================

  updateDots(0);

  startAutoPlay();

});
