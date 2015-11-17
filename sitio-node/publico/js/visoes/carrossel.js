'use strict'

window.VisaoCarrossel = Backbone.View.extend({

  initialize: function () {
    this.render();
  },

  render: function () {
    // Renderiza este template
    $(this.el).html(this.template());
    return this;
  }

});