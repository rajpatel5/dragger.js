(function (global, document, $) {
  /* Adds custom library css to user's project */
  /* ----------------------------------------- */
  // Get HTML head element
  let head = document.getElementsByTagName("HEAD")[0];
  let link = document.createElement("link");

  // set the attributes for link element
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "../src/dragger.css";

  // Append link element to HTML head
  head.appendChild(link);

  /* Draggable Class - Allows users to drag and/or resize an object */
  /* -------------------------------------------------------------- */
  // variables to help with the dragging effect
  let pressedDown = false;
  let isResizing = false;
  let currentResizer;
  let draggableItem = null;
  let prevX, prevY;
  let objLeft, objTop;

  // Draggable class (Takes in class names: type = String, isResizable: type = Boolean)
  function Draggable(draggableClassName, isResizable = false) {
    this.draggableObject = document.querySelector(draggableClassName);
    this.isResizable = isResizable;
    draggableItem = this.draggableObject;
  }

  // Functionality and values common to all Draggable instances
  Draggable.prototype = {
    addListeners: function () {
      // Listeners
      if (draggableItem) {
        draggableItem.addEventListener("mousedown", this.mouseDown);
        draggableItem.addEventListener("mouseenter", () => {
          draggableItem.style.cursor = "grab";
        });

        draggableItem.addEventListener("mouseup", this.mouseUp);

        window.addEventListener("mouseup", () => {
          pressedDown = false;
        });

        window.addEventListener("mousemove", this.mouseMove);

        if (this.isResizable) {
          let resizer = document.createElement("div");
          let resizer_rounded = document.createElement("div");
          resizer.classList.add("_dragger_resizer");
          resizer_rounded.classList.add("_dragger_resizer_rounded");
          draggableItem.appendChild(resizer);
          draggableItem.appendChild(resizer_rounded);
          this.resizer = document.querySelector("._dragger_resizer");
          this.resize();
        }
      } else {
        console.error(
          "Dragger_Draggble: Incorrect draggable class name entered"
        );
      }
    },

    mouseDown: function (e) {
      this.style.cursor = "grabbing";
      pressedDown = true;

      objLeft = draggableItem.offsetLeft;
      objTop = draggableItem.offsetTop;
      prevX = e.clientX;
      prevY = e.clientY;
    },

    mouseMove: function (e) {
      if (!isResizing) {
        if (!pressedDown) {
          return;
        }

        let newX = e.clientX - prevX;
        let newY = e.clientY - prevY;

        draggableItem.style.left = `${objLeft + newX}px`;
        draggableItem.style.top = `${objTop + newY}px`;
      }
    },

    mouseUp: function () {
      this.style.cursor = "grab";
      pressedDown = false;
    },

    resize: function () {
      this.resizer.addEventListener("mousedown", mousedown);

      function mousedown(e) {
        currentResizer = e.target;
        isResizing = true;
        let prevXResize = e.clientX;
        let prevYResize = e.clientY;

        window.addEventListener("mousemove", mousemove);
        window.addEventListener("mouseup", mouseup);

        function mousemove(e) {
          const rect = draggableItem.getBoundingClientRect();

          draggableItem.style.width = `${rect.width - (prevXResize - e.clientX)}px`;
          draggableItem.style.height = `${rect.height - (prevYResize - e.clientY)}px`;

          prevXResize = e.clientX;
          prevYResize = e.clientY;
        }

        function mouseup() {
          window.removeEventListener("mousemove", mousemove);
          window.removeEventListener("mouseup", mouseup);
          isResizing = false;
        }
      }
    },
  };


  /* Droppable Class - Allows users to drop an object in a drop zone */
  /* --------------------------------------------------------------- */
  // Names of draggable and drop zones elements
  let draggableName = "";
  let dropZonesName = "";
  let draggableObj;

  // Droppable class (Takes in class names: type = String)
  function Droppable(draggableClassName, dropZonesClassName) {
    draggableName = draggableClassName.split('.')[1];
    dropZonesName = dropZonesClassName.split('.')[1];
    this.draggableObject = document.querySelector(draggableClassName);
    this.dropZones = document.querySelectorAll(dropZonesClassName);
    draggableObj = this.draggableObject;
  }

  // Functionality and values common to all Droppable instances
  Droppable.prototype = {
    addListeners: function () {
      // Listeners
      if (this.draggableObject && this.dropZones && this.dropZones.length > 0) {
        this.draggableObject.draggable = true;
        this.draggableObject.addEventListener("dragstart", this.dragStart);
        this.draggableObject.addEventListener("dragend", this.dragEnd);

        // Call drag events on empties
        for (const dropZone of this.dropZones) {
          dropZone.addEventListener("dragover", this.dragOver);
          dropZone.addEventListener("dragenter", this.dragEnter);
          dropZone.addEventListener("dragleave", this.dragLeave);
          dropZone.addEventListener("drop", this.drop);
        }
      } else {
        console.error(
          "Dragger_Droppable: Incorrect droppable object class name or drop zones class name entered"
        );
      }
    },

    dragStart: function () {
      this.classList.add("_dragger_hold");
      setTimeout(() => (this.className = "_dragger_invisible"), 0);
    },

    dragEnd: function () {
      this.className = draggableName;
    },

    dragOver: function (e) {
      e.preventDefault();
    },

    dragEnter: function (e) {
      e.preventDefault();
      this.classList.add("_dragger_hovered");
    },

    dragLeave: function () {
      this.className = dropZonesName;
    },

    drop: function () {
      this.className = dropZonesName;
      this.append(draggableObj);
    },
  };


  /* Sortable Class - Allows users to drag and drop objects in 
                      any order in any number of containers    */
  /* --------------------------------------------------------- */
  // Names of draggable and drop zones
  let draggablesName = "";

  // Sortable class (Takes in class names: type = String, indicies: type = Array of Integers)
  function Sortable(draggablesClassName, containersClassName, preventDragIndicies = []) {
    draggablesName = draggablesClassName;
    this.draggableObjects = document.querySelectorAll(draggablesClassName);
    this.containers = document.querySelectorAll(containersClassName);
    this.preventDragIndices = preventDragIndicies;
  }

  // Functionality and values common to all Sortable instances
  Sortable.prototype = {
    addListeners: function () {
      if (
        this.draggableObjects &&
        this.draggableObjects.length > 0 &&
        this.containers &&
        this.containers.length > 0
      ) {
        this.draggableObjects.forEach((draggableObject, i) => {
          if (this.preventDragIndices.includes(i)){
            draggableObject.draggable = false;
            draggableObject.classList.add("_dragger_prevent");
            return;
          }

          draggableObject.draggable = true;
          draggableObject.addEventListener("dragstart", this.dragStart);
          draggableObject.addEventListener("dragend", this.dragEnd);
        });

        this.containers.forEach((container) => {
          container.addEventListener("dragover", (e) => {
            e.preventDefault();
            const afterElement = this.getElemAfterDrag(container, e.clientY);
            const draggable = document.querySelector("._dragger_dragging");

            if (afterElement == null) {
              container.appendChild(draggable);
            } else {
              container.insertBefore(draggable, afterElement);
            }
          });
        });
      } else {
        console.error(
          "Dragger_Sortable: Incorrect sortable objects class name or containers class name entered"
        );
      }
    },

    dragStart: function () {
      this.classList.add("_dragger_dragging");
    },

    dragEnd: function () {
      this.classList.remove("_dragger_dragging");
    },

    getElemAfterDrag: function (container, mouse_y) {
      const draggableElements = [
        ...container.querySelectorAll(draggablesName + ":not(._dragger_dragging)"),
      ];
      return draggableElements.reduce(
        (closest, child) => {
          // Get mouse positions
          const box = child.getBoundingClientRect();
          const offset = mouse_y - box.top - box.height / 2; // Find offset

          // Get the offset that is closest to 0
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          }
          return closest;
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }
  };

  /* DraggableSlider Class - Allows users to drag objects together left to right */
  /* --------------------------------------------------------------------------- */
  // Variables to help with the slider dragging effect
  let pressed = false;
  let startX;
  let xPos;

  // DraggableSlider class (Takes in class names: type = String)
  function DraggableSlider(draggableClassName, containerClassName) {
    this.draggableObject = document.querySelector(draggableClassName);
    this.container = document.querySelector(containerClassName);
  }

  // Functionality and values common to all DraggableSlider instances
  DraggableSlider.prototype = {
    addListeners: function () {
      if (this.draggableObject && this.container) {
        // Listeners
        this.container.addEventListener("mousedown", (e) => {
          pressed = true;
          startX = e.offsetX - this.draggableObject.offsetLeft;
          this.container.style.cursor = "grabbing";
        });

        this.container.addEventListener("mouseenter", () => {
          this.container.style.cursor = "grab";
        });

        this.container.addEventListener("mouseup", () => {
          this.container.style.cursor = "grab";
        });

        window.addEventListener("mouseup", () => {
          pressed = false;
        });

        this.container.addEventListener("mousemove", (e) => {
          if (!pressed) {
            return;
          }
          e.preventDefault();
          xPos = e.offsetX;

          this.draggableObject.style.left = `${xPos - startX}px`;
          this.checkBoundaries();
        });
      } else {
        console.error(
          "Dragger_Draggable_Slider: Incorrect draggable object class name or containers class name entered"
        );
      }
    },

    checkBoundaries: function () {
      let outer = this.container.getBoundingClientRect();
      let inner = this.draggableObject.getBoundingClientRect();

      if (parseInt(this.draggableObject.style.left) > 0) {
        this.draggableObject.style.left = "0px";
      } else if (inner.right < outer.right) {
        this.draggableObject.style.left = `-${inner.width - outer.width}px`;
      }
    }
  };

  /* Rotatable class - Allows users to do a 360 degree spin on objects */
  /* ----------------------------------------------------------------- */
  (function ($) {
    $.fn.extend({
      rotatable: function (params) {
        Rotatable(this.selector, params);
        return;
      },
    });

    function Rotatable(selectorName, params) {
      // Assigning params
      this.selector = $(selectorName);
      this.imgSequencePath = params.imgSequencePath;
      this.numOfImgs = params.numOfImgs;
      this.imgExt = params.imgExt || "png";
      this.isRotating = false;
      this.currentX = 0;
      this.currImg = 1;

      function addListeners() {
        selector.mousedown(function (target) {
          isRotating = true;
          currentX = target.pageX - this.offsetLeft;
        });

        selector.mousemove(function (target) {
          if (isRotating) {
            loadImg(target.pageX - this.offsetLeft);
          }
        });

        $(document).mouseup(function () {
          isRotating = false;
        });

        selector.bind("touchstart", function (target) {
          isRotating = true;

          // Store start position
          let actualTouch =
            target.originalEvent.touches[0] ||
            target.originalEvent.changedTouches[0];
          currentX = actualTouch.clientX;
        });

        $(document).bind("touchend", function () {
          isRotating = false;
        });

        selector.bind("touchmove", function (target) {
          target.preventDefault();
          let actualTouch =
            target.originalEvent.touches[0] ||
            target.originalEvent.changedTouches[0];

          if (!isRotating) {
            currentX = actualTouch.pageX - this.offsetLeft;
          } else {
            loadImg(actualTouch.pageX - this.offsetLeft);
          }
        });
      }

      function loadImg(newX) {
        if (currentX - newX > 25) {
          // Compute which image to load
          currImg = --currImg < 1 ? numOfImgs : currImg;
          currentX = newX;

          // Set css
          selector.css(
            "background-image",
            "url(" + imgSequencePath + currImg + "." + imgExt + ")"
          );
        } else if (currentX - newX < -25) {
          currImg = ++currImg > numOfImgs ? 1 : currImg;
          currentX = newX;

          // Set css
          selector.css(
            "background-image",
            "url(" + imgSequencePath + currImg + "." + imgExt + ")"
          );
        }
      }

      function loadAllImgs() {
        // Load first image
        let loadedImgs = 2;
        let imgURL = imgSequencePath + "1." + imgExt;
        selector.css("background-image", "url(" + imgURL + ")");

        $("<img/>")
          .attr("src", imgURL)
          .load(function () {
            selector.height(this.height).width(this.width);
          });

        // Load other images
        for (let i = 2; i <= numOfImgs; i++) {
          imgURL = imgSequencePath + i + "." + imgExt;
          selector.append("<img src='" + imgURL + "' style='display: none;'>");

          // Set img attributes and css, also a loading overlay if needed
          $("<img/>")
            .attr("src", imgURL)
            .css("display", "none")
            .load(function () {
              loadedImgs++;
              if (loadedImgs >= numOfImgs) {
                $("#loading").removeClass("onLoadingDiv");
                $("#loading").text("");
              }
            });
        }
      }

      function loadingOverlay() {
        $("html").append(
          "<style type='text/css'>.onLoadingDiv{background-color:#00FF00;opacity:0.5;text-align:center;font-size:2em;font:color:#000000;}</style>"
        );
        $(selector).html(
          "<div id='loading' style='height:100%;width:100%;' class='onLoadingDiv'>Loading...</div>"
        );
      }

      loadingOverlay();
      loadAllImgs();
      addListeners();
    }
  })(jQuery);

  global.Draggable = global.Draggable || Draggable;
  global.Droppable = global.Droppable || Droppable;
  global.Sortable = global.Sortable || Sortable;
  global.DraggableSlider = global.DraggableSlider || DraggableSlider;
})(window, window.document, $);
