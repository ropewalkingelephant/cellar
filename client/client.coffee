Session.setDefault('form_visibility', 'invisible')
Session.setDefault('editing', false)
Session.setDefault('sort_field', 'ref')
Session.setDefault('sort_by', -1)

Meteor.autorun ->
	Meteor.subscribe('wines', Meteor.userId())

Template.nav.events {
	'tap #new, click #new': ->
		if Meteor.userId()
			Session.set('editing', false)
			Session.set('form_visibility', 'visible')
		else
			alert("Please sign-in first!")
}

Template.list.wines = ->
	sort = {}
	sort[Session.get('sort_field')] = Session.get('sort_by')
	Wines.find({}, sort: sort)

Template.list.events {
	'tap .edit, click .edit': ->
		wine = Wines.findOne({ _id: @_id })

		Session.set('editing', @_id)
		Session.set('form_visibility', 'visible')

		$('#form').populate(wine);

	'tap th a, click th a': (e) ->
		Session.set('sort_field', e.target.id)

		if Session.get('sort_by') == 1
			Session.set('sort_by', -1)
		else
			Session.set('sort_by', 1)
}

Template.form.visibility = ->
	Session.get('form_visibility')

Template.form.events {
	'tap #save, click #save': (e, template) ->
		e.preventDefault()

		data = $('#form').toObject();

		if Session.get('editing')
			Meteor.call('update', Session.get('editing'), data)
		else
			Meteor.call('create', data)

		template.find('#form').reset()
		Session.set('form_visibility', 'invisible')

	'tap #cancel, click #cancel': (e, template) ->
		Session.set('editing', false)
		template.find('#form').reset()
		Session.set('form_visibility', 'invisible')

	'tap #delete, click #delete': (e, template) ->
		if confirm("Are you sure?")
			Meteor.call('remove', Session.get('editing'))
			Session.set('form_visibility', 'invisible')
			Session.set('editing', false)
			template.find('#form').reset()			
}