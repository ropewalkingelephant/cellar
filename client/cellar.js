Deps.autorun(function() {
  Meteor.subscribe('wineries', Session.get('winery'));
  Meteor.subscribe('regions', Session.get('region'));
  Meteor.subscribe('varieties', Session.get('variety'));
});

Template.nav.helpers({
  totalValue: function() {
    var total = 0;
    Wines.find({
      qty: {
        $gt: 0
      }
    }).forEach(function(wine) {
      var qty = parseInt(wine.qty);
      if (qty !== 'NaN' && qty) {
        total += qty;
      }
    });
    return total;
  },
  totalWines: function() {
    var total = 0;
    Wines.find({
      qty: {
        $gt: 0
      }
    }).forEach(function(wine) {
      var price = parseInt(wine.price) * wine.qty;
      if (price !== 'NaN' && price) {
        total += price;
      }
    });
    return accounting.formatMoney(total);
  }
});

Template.search.events({
  'keyup #search': function() {
    Session.set('search', $('#search').val());
  },
  'click .clear': function() {
    Session.set('search', '');
  }
});

Template.search.helpers({
  search: function() {
    return Session.get('search');
  },
  hasSearch: function() {
    return !!Session.get('search');
  }
});

var winesCursor = function(query) {
  if (Session.get('search')) {
    var regexp = { $regex: Session.get('search'), $options: 'i' };
    query.$or = [
      { name: regexp },
      { winery: regexp },
      { region: regexp },
      { year: regexp },
      { type: regexp }
    ];
  }
  return Wines.find(query, { sort: { ref: -1 }});
};

Template.home.helpers({
  wines: function() {
    return winesCursor({ qty: { $gt: 0 }});
  }
});

Template.archive.helpers({
  wines: function() {
    return winesCursor({ qty: 0 });
  }
});

Template.form.helpers({
  selectOptionsQty: function() {
    return {
      name: 'qty',
      value: this.qty,
      options: _.map(_.range(25), function(qty) {
        return {
          name: qty,
          value: qty
        };
      })
    };
  },
  selectOptionsRating: function() {
    return {
      name: 'rating',
      value: this.rating,
      options: [
        {
          name: 'None',
          value: 'None'
        }
      ].concat(_.map(_.range(1, 11).reverse(), function(rating) {
        return {
          name: rating,
          value: rating
        };
      }))
    };
  },
  varieties: function() {
    return Varieties.find({ }, { sort: name });
  },
  wineries: function() {
    return Wineries.find({}, { sort: name });
  },
  regions: function() {
    return Regions.find({}, { sort: name });
  }
});

Template.select.helpers({
  decoratedOptions: function() {
    var self = this;
    return _.map(self.options, function(option) {
      option.selected = option.value === parseInt(self.value);
      return option;
    });
  }
});

Template.form.events({
  'keyup input[name="type"]': function(e, template) {
    if (e.target.value.length > 1) {
      return Session.set('variety', e.target.value);
    } else {
      return Session.set('variety', '');
    }
  },
  'keyup input[name="winery"]': function(e, template) {
    if (e.target.value.length > 1) {
      return Session.set('winery', e.target.value);
    } else {
      return Session.set('winery', '');
    }
  },
  'keyup input[name="region"]': function(e, template) {
    if (e.target.value.length > 1) {
      return Session.set('region', e.target.value);
    } else {
      return Session.set('region', '');
    }
  },
  'click .autocomplete-type a': function(e) {
    Session.set('variety', '');
    $('input[name="type"]').val(e.target.text);
  },
  'click .autocomplete-winery a': function(e) {
    Session.set('winery', '');
    $('input[name="winery"]').val(e.target.text);
  },
  'click .autocomplete-region a': function(e) {
    Session.set('region', '');
    $('input[name="region"]').val(e.target.text);
  },
  'click #save': function(e, template) {
    e.preventDefault();
    var data = $('#form').toObject();
    if (!data.name) {
      alert("Name is required");
      return;
    }
    if (this._id) {
      Meteor.call('update', this._id, data);
    } else {
      Meteor.call('create', data);
    }
    Router.go('home');
  },
  'click #delete': function(e, template) {
    e.preventDefault();
    if (confirm("Are you sure?")) {
      Meteor.call('remove', this._id);
      Router.go('home');
    }
  },
  'click #cancel': function(e, template) {
    e.preventDefault();
    Router.go('home');
  }
});

Template.form.rendered = function() {
  return window.scrollTo();
};

Template.list.rendered = function() {
  if (Session.equals('loaded', true))
    new Packery('.row');
};