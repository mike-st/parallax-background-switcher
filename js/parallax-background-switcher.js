

define([
	'coreJS/adapt'
], function(Adapt) {

	var ParallaxbgSwitcherView = Backbone.View.extend({

		_blockModels: null,
		_blockModelsIndexed: null,
		_onBlockInview: null,
		$backgroundContainer: null,
		$backgrounds: null,
		$blockElements: null,
		_firstId: null,
		_activeId: null,

		initialize: function() {
			this._blockModels = this.model.findDescendants('blocks').filter(function(model) {
				return model.get("_parallaxbgSwitcher");
			});
			if(this._blockModels.length == 0) {
			        this.onRemove();
			        return;
			}
			this._blockModelsIndexed = _.indexBy(this._blockModels, "_id");

			this.listenTo(Adapt, "pageView:ready", this.onPageReady);
			this.listenTo(Adapt, "remove", this.onRemove);
			this.setupBackgroundContainer();
		},

		onPageReady: function() {

			this.$blockElements = {};
			this.$backgrounds = {};
			this.callbacks = {};

			for (var i = 0, l = this._blockModels.length; i < l; i++) {
				var blockModel = this._blockModels[i];				
				if(!blockModel.get('_parallaxbgSwitcher')) continue;

				var id = blockModel.get("_id");

				if (!this._firstId) this._firstId = id;

				var $blockElement = this.$el.find("."+ id);

				$blockElement.attr("data-ParallaxbgSwitcher", id);
				this.$blockElements[id] = $blockElement;

				var options = blockModel.get('_parallaxbgSwitcher');
				var thebgoptions = this.model.get("_parallaxbgSwitcher")._bgoptions; // INSERTED
	            
	            this.callbacks[id] = _.bind(this.onBlockInview, this);

	            this.$blockElements[id].on("onscreen", this.callbacks[id]);

	            if (options.src == ""){
	            	$blockElement.addClass('background-switcher-block').css({'background-image': 'url('+options.src+')','height': 'auto','width': '100%','position': 'relative','box-shadow': '0px 0px 40px rgba(0,0,0,0.0)','border-top': '0px solid #FFFFFF','background-repeat': 'no-repeat','background-attachment': 'fixed'}); //INSERTED
		    }else{
			$blockElement.addClass('background-switcher-block').css({'background-image': 'url('+options.src+')','height': 'auto','width': '100%','position': 'relative','box-shadow': '0px 0px 40px rgba(0,0,0,0.5)','border-top': '3px solid #FFFFFF','background-repeat': 'no-repeat','background-attachment': 'fixed'}); //INSERTED
		    }

	            if ( $('.article').hasClass('article-block-slider-enabled') ) {
			    $('.article-block-slider-enabled .background-switcher-block').removeAttr( 'style' ).removeAttr( 'data-parallaxbgswitcher' ).removeClass('background-switcher-block');  
		    } else {
				var $backGround = $('<div class="background-switcher-background" style="background-image: url('+options.src+');"></div>');
				this.$backgroundContainer.prepend($backGround);
				this.$backgrounds[id] = $backGround;

				$blockElement.find('.block-inner').addClass('background-switcher-block-mobile').css({'background-image': 'url('+options.mobileSrc+')'});
		    }

			}

			this._activeId = this._firstId;
			
			if (thebgoptions === 'animation') { // INSERTED
				this.$('.background-switcher-block').removeAttr( 'style' );
                this.showBackground();
            } else if (thebgoptions === 'parallax') {// INSERTED
                this.showParallax();// INSERTED
            }// INSERTED

            _.delay(function() {
                $(window).resize();
            }, 250);


		},

		setupBackgroundContainer : function() {

			var bgcontaineronoff = this.model.get("_parallaxbgSwitcher")._bgoptions;// INSERTED
			
			if (bgcontaineronoff === 'animation') { // INSERTED
                this.$backgroundContainer = $('<div class="background-switcher-container"></div>');
				this.$el.addClass('background-switcher-active');
				this.$el.prepend(this.$backgroundContainer);
            } else if (bgcontaineronoff === 'parallax') {// INSERTED
                this.$backgroundContainer = $('<div class="no-switcher"></div>');
				this.$el.addClass('background-switcher-active');
				this.$el.prepend(this.$backgroundContainer);
            }// INSERTED

		},
		

		onBlockInview: function(event, measurements) {
			var isOnscreen = measurements.percentFromTop < 80 && measurements.percentFromBottom < 80 ;
			if (!isOnscreen) return;

			var $target = $(event.target);
			var id = $target.attr("data-ParallaxbgSwitcher");

			if (this._activeId === id) return;

			this._activeId = id;

            var aniselect = this.model.get("_parallaxbgSwitcher")._bgoptions;// INSERTED

            if (aniselect === 'animation') { // INSERTED
                this.showBackground();
            } else if (aniselect === 'parallax') {// INSERTED
                this.showParallax();// INSERTED
            }// INSERTED

		},

		showBackground: function() {
			var blockModel = this._blockModelsIndexed[this._activeId];

			if(Modernizr.csstransitions){
				$('.active').removeClass('active');
				this.$backgrounds[this._activeId].addClass('active');
			}
			else {
				$('.active').animate({opacity:0}, 1000, function(){ $(this).removeClass('active'); });
				this.$backgrounds[this._activeId].animate({opacity:1}, 1000, function(){ $(this).addClass('active'); });
			}
		},

		showParallax: function() {// INSERTED
			var blockModel = this._blockModelsIndexed[this._activeId];

			if(Modernizr.csstransitions){
				this.$backgrounds[this._activeId].removeClass('active');
			}
			else {
				this.$backgrounds[this._activeId].removeClass('active');
			}

		},

		onRemove: function () {
			for (var id in this.$blockElements) {
				this.$blockElements[id].off("onscreen", this.callbacks[id]);
			}
			this.$blockElements = null;
			//this.$backgroundContainer = null;
			this.$backgrounds = null;
			//this._blockModels = null;
			//this._blockModelsIndexed = null;
			this._onBlockInview = null;
		}


	});

	Adapt.on("pageView:postRender", function(view) {
		var model = view.model;
		if (model.get("_parallaxbgSwitcher")) {
			if (model.get("_parallaxbgSwitcher")._isActive) {
				new ParallaxbgSwitcherView({model: model, el: view.el });
			}
		}
	});

});	
