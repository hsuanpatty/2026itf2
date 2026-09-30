
/* =========================================================
1. 國家 / 優惠篩選
========================================================= */
(function () {
  "use strict";

  var currentCountry = "all";
  var currentOffer = "all";

  window.__mergedCurrentCountry = currentCountry;
  window.__mergedCurrentOffer = currentOffer;

  /* ========================================
  更新國家 / 優惠篩選器內容
  ======================================== */
  function updateMergedFilters() {
    var visibleCount = 0;

    $(".merged-country-group").each(function () {
      var $group = $(this);
      var groupCountry = $.trim($group.attr("data-country-group") || "");

      /* ----------------------------------------
      國家類別匹配
      ---------------------------------------- */
      var countryMatch = currentCountry === "all" || groupCountry === currentCountry;

      /* ----------------------------------------
      國家不符合
      ---------------------------------------- */
      if (!countryMatch) {
        $group.addClass("is-hidden").css("display", "none");

        /*
        * 同時隱藏裡面的行程
        * 避免之前優惠篩選狀態殘留
        */
        $group.find("li[data-offer-type]").each(function () {
          $(this).addClass("is-hidden").css("display", "none");
        });

        $group.find(".chosen-box").each(function () {
          $(this).addClass("is-hidden").css("display", "none");
        });

        return;
      }

      /* ----------------------------------------
      國家符合
      ---------------------------------------- */
      $group.removeClass("is-hidden").css("display", "");

      var groupHasVisibleBox = false;

      /* ----------------------------------------
      每個 chosen-box
      ---------------------------------------- */
      $group.find(".chosen-box").each(function () {
        var $box = $(this);
        var boxVisible = false;

        /* ----------------------------------------
        每一筆行程
        ---------------------------------------- */
        $box.find("li[data-offer-type]").each(function () {
          var $item = $(this);

          /*
          * ★ 唯一分類依據
          *
          * data-offer-type：
          * limited
          * second
          * upgrade
          */
          var offerType = $.trim($item.attr("data-offer-type") || "");

          /* ----------------------------------------
          優惠類型是否符合
          ---------------------------------------- */
          var offerMatch = currentOffer === "all" || offerType === currentOffer;

          /* ----------------------------------------
          行程自己的國家
          ---------------------------------------- */
          var itemCountry = $.trim($item.attr("data-country") || "");

          var itemCountryMatch =
            currentCountry === "all" ||
            (itemCountry === "" && groupCountry === currentCountry) ||
            itemCountry === currentCountry;

          /* ----------------------------------------
          最終顯示條件
          ---------------------------------------- */
          var shouldShow = offerMatch && itemCountryMatch;

          /* ----------------------------------------
          顯示
          ---------------------------------------- */
          if (shouldShow) {
            $item.removeClass("is-hidden").css("display", "");

            boxVisible = true;
            visibleCount++;
          } else {
            /* ----------------------------------------
            隱藏
            ---------------------------------------- */
            $item.addClass("is-hidden").css("display", "none");
          }
        });

        /* ----------------------------------------
        chosen-box 是否還有行程
        ---------------------------------------- */
        if (boxVisible) {
          $box.removeClass("is-hidden").css("display", "");

          groupHasVisibleBox = true;
        } else {
          $box.addClass("is-hidden").css("display", "none");
        }
      });

      /* ----------------------------------------
      國家區塊是否還有行程
      ---------------------------------------- */
      if (groupHasVisibleBox) {
        $group.removeClass("is-hidden").css("display", "");
      } else {
        $group.addClass("is-hidden").css("display", "none");
      }
    });

    /* ========================================
    更新畫面行程筆數
    ======================================== */
    $(".merged-result-count").text("目前顯示 " + visibleCount + " 組優惠行程");

    /* ========================================
    無相符行程提示
    ======================================== */
    if (visibleCount === 0) {
      $(".offer-empty-state").prop("hidden", false).removeAttr("hidden").show();
    } else {
      $(".offer-empty-state").prop("hidden", true).attr("hidden", "hidden").hide();
    }

    /* ========================================
    儲存目前狀態
    ======================================== */
    window.__mergedCurrentCountry = currentCountry;

    window.__mergedCurrentOffer = currentOffer;
  }

  /* ========================================
  切換國家頁籤 Active 狀態

  ★ 電腦版 + 手機版同步
  ======================================== */
  function setCountryActive(country) {
    /*
    * ----------------------------------------
    * 先清除所有國家 Active
    * ----------------------------------------
    */
    $(".country-tab").removeClass("active").attr("aria-selected", "false");

    $(".mobile-country-filter").removeClass("active");

    /*
    * ----------------------------------------
    * 電腦版國家按鈕
    * ----------------------------------------
    */
    $('.country-tab[data-country-filter="' + country + '"], ' + '.country-tab[data-country="' + country + '"]')
    .addClass("active")
    .attr("aria-selected", "true");

    /*
    * ----------------------------------------
    * ★ 手機版國家按鈕
    *
    * 只會有一個 active
    * ----------------------------------------
    */
    $('.mobile-country-filter[data-country-filter="' + country + '"], ' + '.mobile-country-filter[data-country="' + country + '"]').addClass("active");

    /*
    * ----------------------------------------
    * 如果手機版是 select
    * ----------------------------------------
    */
    if ($("select.mobile-country-filter").length) {
      $("select.mobile-country-filter").val(country);
    }

    /*
    * ----------------------------------------
    * ★ 將目前選取國家寫入 DOM
    *
    * 讓 CSS 可以使用：
    *
    * .mobile-country-filter.active
    *
    * ----------------------------------------
    */
    $(".mobile-country-filter").attr("aria-current", "false");

    $('.mobile-country-filter[data-country-filter="' + country + '"], ' + '.mobile-country-filter[data-country="' + country + '"]').attr(
    "aria-current",
    "page",
    );
  }

  /* ========================================
  點選國家頁籤
  ======================================== */
  $(document).on("click", ".country-tab, .mobile-country-filter", function (e) {
    e.preventDefault();

    var country = $(this).attr("data-country-filter") || $(this).attr("data-country") || $(this).val();

    if (!country) {
      return;
    }

    /* ----------------------------------------
    更新目前國家
    ---------------------------------------- */
    currentCountry = country;

    window.__mergedCurrentCountry = currentCountry;

    /*
    * ★ 先更新 Active
    * 再更新篩選
    */
    setCountryActive(country);

    updateMergedFilters();

    /* ----------------------------------------
    滾動定位
    ---------------------------------------- */
    var $mainTitle = $(".merged-content-title");

    var $targetGroup = $('.merged-country-group[data-country-group="' + country + '"]');

    /*
    * 「全部國家」
    * 定位旅展精選行程標題
    *
    * 其他國家
    * 沿用原本定位邏輯
    */
    var $targetElement = $mainTitle.length ? $mainTitle : $targetGroup;

    if ($targetElement.length) {
      setTimeout(function () {
        var menuHeight = $(".menu-height").outerHeight() || 54;

        var navHeight = $(".merged-country-nav").outerHeight() || 60;

        var totalHeaderHeight = menuHeight + navHeight;

        /*
        * 預留空間
        * 避免旅展精選行程被選單遮住
        */
        var extraPadding = 70;

        var targetTop = $targetElement.offset().top - totalHeaderHeight - extraPadding;

        targetTop = Math.max(0, targetTop);

        $("html, body").stop(true, false).animate(
        {
          scrollTop: targetTop,
        },
        400,
        );
      }, 50);
    }

    /* ----------------------------------------
    ★ 手機版
    點選後關閉抽屜

    但 Active 不會消失
    ---------------------------------------- */
    if ($(this).hasClass("mobile-country-filter") || $(this).closest(".mobile-menu").length) {
      /*
      * Active 已經在上面設定完成
      * 這裡只負責關閉抽屜
      */
      $("body").removeClass("mobile-menu-open");

      $(".mobile-menu").removeClass("open active");

      $(".mobile-menu-toggle").removeClass("active");
    }
  });

  /* ========================================
  手機下拉選單 Select
  ======================================== */
  $(document).on("change", "select.mobile-country-filter", function () {
    var country = $(this).val();

    if (!country) {
      return;
    }

    currentCountry = country;

    window.__mergedCurrentCountry = currentCountry;

    setCountryActive(country);

    updateMergedFilters();
  });

  /* ========================================
  優惠類別切換

  all
  limited
  second
  upgrade
  ======================================== */
  $(document).on("click", ".offer-filter", function (e) {
    e.preventDefault();

    var offer = $.trim($(this).attr("data-offer-filter") || "");

    if (!offer) {
      return;
    }

    /*
    * 只接受目前定義的四種分類
    */
    var validOffers = ["all", "limited", "second", "upgrade"];

    if ($.inArray(offer, validOffers) === -1) {
      return;
    }

    currentOffer = offer;

    window.__mergedCurrentOffer = currentOffer;

    /*
    * Active
    */
    $(".offer-filter").removeClass("active");

    $(this).addClass("active");

    /*
    * 重新篩選
    */
    updateMergedFilters();
  });

  /* ========================================
  預設載入初始化
  ======================================== */
  function initMergedFilters() {
    currentCountry = "all";

    currentOffer = "all";

    window.__mergedCurrentCountry = "all";

    window.__mergedCurrentOffer = "all";

    /*
    * ★ 電腦 + 手機
    * 預設「全部國家」Active
    */
    setCountryActive("all");

    /*
    * 優惠 Active
    */
    $(".offer-filter").removeClass("active");

    $('.offer-filter[data-offer-filter="all"]').addClass("active");

    /*
    * 第一次完整篩選
    */
    updateMergedFilters();
  }

  /* ========================================
  DOM Ready
  ======================================== */
  $(function () {
    initMergedFilters();
  });
})();

/* =========================================================
2. 國家導覽列 Sticky 吸附效果
========================================================= */
(function () {
  "use strict";

  var $nav = $(".merged-country-nav");

  var $spacer = $(".merged-country-nav-spacer");

  if (!$nav.length) {
    return;
  }

  var originalTop = 0;
  var navHeight = 0;
  var stickyOffset = 54;

  /* ========================================
  判斷手機 / 平板
  ======================================== */
  function isSmallScreen() {
    return window.innerWidth <= 1199;
  }

  /* ========================================
  計算原始位置
  ======================================== */
  function calculatePosition() {
    removeSticky();

    navHeight = $nav.outerHeight() || 0;

    var $menu = $(".menu-height");

    var menuHeight = $menu.length ? $menu.outerHeight() || 0 : 54;

    originalTop = $nav.offset().top - menuHeight;
  }

  /* ========================================
  設定 Sticky
  ======================================== */
  function setSticky() {
    navHeight = $nav.outerHeight() || 0;

    $nav.addClass("is-sticky").css({
      position: "fixed",
      top: stickyOffset + "px",
      left: "0px",
      right: "0px",
      width: "100%",
      zIndex: 9998,
      "border-radius": "0px",
    });

    if ($spacer.length) {
      $spacer.height(navHeight).addClass("is-sticky");
    }
  }

  /* ========================================
  移除 Sticky
  ======================================== */
  function removeSticky() {
    $nav.removeClass("is-sticky").css({
      position: "",
      top: "",
      left: "",
      right: "",
      width: "",
      zIndex: "",
      "border-radius": "",
    });

    if ($spacer.length) {
      $spacer.height(0).removeClass("is-sticky");
    }
  }

  /* ========================================
  更新 Sticky
  ======================================== */
  function updateCountryNav() {
    if (!$nav.length) {
      return;
    }

    var scrollTop = $(window).scrollTop();

    /* ----------------------------------------
    手機 / 平板
    ---------------------------------------- */
    if (isSmallScreen()) {
      if (scrollTop >= originalTop) {
        setSticky();
      } else {
        removeSticky();
      }

      return;
    }

    /* ----------------------------------------
    桌機
    ---------------------------------------- */
    var menuHeight = $(".menu-height").outerHeight() || stickyOffset;

    if (scrollTop >= originalTop) {
      navHeight = $nav.outerHeight() || 0;

      $nav.addClass("is-sticky").css({
        position: "fixed",
        top: menuHeight + "px",
        left: "0px",
        right: "0px",
        width: "100%",
        zIndex: 9998,
        "border-radius": "0px",
      });

      if ($spacer.length) {
        $spacer.height(navHeight).addClass("is-sticky");
      }
    } else {
      removeSticky();
    }
  }

  /* ========================================
  Refresh
  ======================================== */
  function refreshCountryNav() {
    removeSticky();

    calculatePosition();

    updateCountryNav();
  }

  $(window).on("scroll", function () {
    window.requestAnimationFrame(updateCountryNav);
  });

  $(window).on("resize", function () {
    clearTimeout(window.__countryNavResizeTimer);

    window.__countryNavResizeTimer = setTimeout(refreshCountryNav, 80);
  });

  $(window).on("load", function () {
    setTimeout(refreshCountryNav, 100);
  });

  setTimeout(refreshCountryNav, 300);
})();

/* =========================================================
3. Scroll Spy 滾動自動偵測導覽頁籤高亮
========================================================= */
(function () {
  "use strict";

  function updateScrollSpy() {
    /*
    * 使用者選定特定國家時
    * 不讓 Scroll Spy 搶 Active
    */
    if (window.__mergedCurrentCountry !== "all") {
      return;
    }

    var scrollTop = $(window).scrollTop();

    var menuHeight = $(".menu-height").outerHeight() || 0;

    var navHeight = $(".merged-country-nav").outerHeight() || 0;

    var fixedTop = window.innerWidth <= 1199 ? 54 : menuHeight;

    var offsetTop = scrollTop + fixedTop + navHeight + 20;

    var currentGroup = null;

    $(".merged-country-group[data-country-group]").each(function () {
      var $group = $(this);

      /*
      * 被優惠篩選隱藏的國家
      * 不參與 Scroll Spy
      */
      if ($group.hasClass("is-hidden") || $group.css("display") === "none") {
        return;
      }

      var groupTop = $group.offset().top;

      if (groupTop <= offsetTop) {
        currentGroup = $group.attr("data-country-group");
      }
    });

    if (currentGroup) {
      /*
      * 桌機 Active
      */
      $(".country-tab").removeClass("active").attr("aria-selected", "false");

      $('.country-tab[data-country-filter="' + currentGroup + '"], ' + '.country-tab[data-country="' + currentGroup + '"]')
      .addClass("active")
      .attr("aria-selected", "true");

      /*
      * ★ 手機 Active 同步
      *
      * Scroll Spy 發現目前位於哪個國家
      * 手機選單也同步顯示該國家
      */
      $(".mobile-country-filter").removeClass("active").attr("aria-current", "false");

      $('.mobile-country-filter[data-country-filter="' + currentGroup + '"], ' + '.mobile-country-filter[data-country="' + currentGroup + '"]')
      .addClass("active")
      .attr("aria-current", "page");
    }
  }

  $(window).on("scroll", function () {
    window.requestAnimationFrame(updateScrollSpy);
  });

  $(window).on("resize", updateScrollSpy);

  $(window).on("load", function () {
    setTimeout(function () {
      if (window.__mergedCurrentCountry === "all") {
        /*
        * 桌機
        */
        $(".country-tab").removeClass("active").attr("aria-selected", "false");

        $('.country-tab[data-country-filter="all"], ' + '.country-tab[data-country="all"]')
        .addClass("active")
        .attr("aria-selected", "true");

        /*
        * ★ 手機
        */
        $(".mobile-country-filter").removeClass("active").attr("aria-current", "false");

        $('.mobile-country-filter[data-country-filter="all"], ' + '.mobile-country-filter[data-country="all"]')
        .addClass("active")
        .attr("aria-current", "page");
      }

      updateScrollSpy();
    }, 300);
  });
})();

/* =========================================================
4. 回到頂部 GoTop
========================================================= */
(function () {
  "use strict";

  var $goTop = $("#goTop");

  if (!$goTop.length) {
    return;
  }

  function checkGoTop() {
    var scrollTop = $(window).scrollTop();

    var windowHeight = $(window).height();

    if (scrollTop > windowHeight) {
      $goTop.addClass("show");
    } else {
      $goTop.removeClass("show");
    }
  }

  $(window).on("scroll", checkGoTop);

  $goTop.on("click", function (e) {
    e.preventDefault();

    $("html, body").stop().animate(
    {
      scrollTop: 0,
    },
    500,
    );
  });

  checkGoTop();
})();

/* =========================================================
5. 手機版漢堡選單與展開折疊選單
========================================================= */
(function () {
  "use strict";

  /* ========================================
  漢堡按鈕
  ======================================== */
  $(document).on("click", ".mobile-menu-toggle", function (e) {
    e.preventDefault();

    $("body").toggleClass("mobile-menu-open");

    $(".mobile-menu").toggleClass("open active");

    $(this).toggleClass("active");
  });

  /* ========================================
  手機主項目
  ======================================== */
  $(document).on("click", ".mobile-main-item", function (e) {
    var $this = $(this);

    var $parent = $this.closest(".mobile-has-more");

    if (!$parent.length) {
      return;
    }

    e.preventDefault();

    $parent.toggleClass("open active");

    updateMobileArrow();
  });

  /* ========================================
  更新手機箭頭
  ======================================== */
  function updateMobileArrow() {
    $(".mobile-has-more").each(function () {
      var $item = $(this);

      var $arrow = $item.find(".mobile-arrow i");

      if ($item.hasClass("open") || $item.hasClass("active")) {
        $arrow.removeClass("fa-plus").addClass("fa-minus");
      } else {
        $arrow.removeClass("fa-minus").addClass("fa-plus");
      }
    });
  }

  /* ========================================
  點箭頭
  ======================================== */
  $(document).on("click", ".mobile-has-more > .mobile-arrow", function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $parent = $(this).closest(".mobile-has-more");

    $parent.toggleClass("open active");

    updateMobileArrow();
  });

  updateMobileArrow();
})();

/* =========================================================
6. 出發日期文字多字截斷
========================================================= */
(function () {
  "use strict";

  var TRAVEL_DATE_DESKTOP_MAX_LENGTH = 40;

  var TRAVEL_DATE_TABLET_MAX_LENGTH = 12;

  var TRAVEL_DATE_MOBILE_MAX_LENGTH = 25;

  function limitTravelDateText() {
    $(".travel-date-xl p").each(function () {
      var $el = $(this);

      var originalText = $el.attr("data-original-text");

      /*
      * 第一次保留原始文字
      */
      if (!originalText) {
        originalText = $.trim($el.text());

        $el.attr("data-original-text", originalText);
      }

      var maxLength;

      /*
      * 手機
      */
      if (window.innerWidth <= 767) {
        maxLength = TRAVEL_DATE_MOBILE_MAX_LENGTH;

        /*
        * 平板
        */
      } else if (window.innerWidth <= 991) {
        maxLength = TRAVEL_DATE_TABLET_MAX_LENGTH;

        /*
        * 桌機
        */
      } else {
        maxLength = TRAVEL_DATE_DESKTOP_MAX_LENGTH;
      }

      /*
      * 超過字數
      */
      if (originalText.length > maxLength) {
        $el.text(originalText.substring(0, maxLength) + "...");

        $el.attr("title", originalText);
      } else {
        $el.text(originalText);

        $el.removeAttr("title");
      }
    });
  }

  /*
  * 初次執行
  */
  limitTravelDateText();

  /*
  * 頁面完成後再執行一次
  */
  $(window).on("load", function () {
    setTimeout(limitTravelDateText, 100);
  });

  /*
  * 視窗尺寸變更
  */
  $(window).on("resize", limitTravelDateText);
})();
