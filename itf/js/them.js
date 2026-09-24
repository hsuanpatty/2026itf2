$(function () {

  /* =========================
   * 1. 側邊選單展開 / 收合
   * ========================= */

  $(".parent .fa.fa-plus").remove();
  $(".parent .toggled").append("<i class='fa fa-plus'></i>");

  $('.parent .toggled').on('click', function (e) {

    e.preventDefault();

    const $parent = $(this).parent();
    const $target = $parent.next("ul");

    // 先停止所有動畫
    $(".parent + ul").stop(true, true);

    // 如果目前沒開啟
    if (!$parent.hasClass("active")) {

      $(".parent.active")
        .removeClass("active")
        .next("ul")
        .slideUp(200);

      $parent
        .addClass("active");

      $target
        .slideDown(200);

    } else {

      $parent
        .removeClass("active");

      $target
        .slideUp(200);
    }

  });


  /* =========================
   * 2. 平滑滑動 + 避免被 header 遮住
   * ========================= */

  $(".nav-column ul li a").on("click", function (e) {

    if (!this.hash) return;

    const target = $(this.hash);

    if (!target.length) return;

    e.preventDefault();

    const offset =
      $(".menu-height").outerHeight() || 80;

    $("html, body")
      .stop(true)
      .animate({
        scrollTop: target.offset().top - offset
      }, 600);

  });


  /* =========================
   * 3. 回首頁（可選）
   * ========================= */

  $(".nav-column ul li a").eq(0).on("click", function () {
    $(".nav-column").css("position", "static");
  });

});

$(function () {

    /* ========================================
       手機版漢堡選單
    ======================================== */

    $(".mobile-menu-toggle").on("click", function () {

        $(this).toggleClass("active");

        $(".mobile-menu").toggleClass("active");

    });


    /* ========================================
       線上旅展子選單
    ======================================== */

    $(".mobile-main-item").on("click", function (e) {

        e.preventDefault();

        $(this)
            .parent(".mobile-has-more")
            .toggleClass("active");

    });

});