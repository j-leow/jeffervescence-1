class App {
  constructor(selectors) {
    this.flicks = []
    this.max = 0
    this.list = document
      .querySelector(selectors.listSelector)
    this.template = document
      .querySelector(selectors.templateSelector)
    document
      .querySelector(selectors.formSelector)
      .addEventListener('submit', this.addFlickViaForm.bind(this))

    this.load()
  }

  load() {
    // Get the JSON string out of localStorage
    const flicksJSON = localStorage.getItem('flicks')

    // Turn that into an array
    const flicksArray = JSON.parse(flicksJSON)

    // Set this.flicks to that array
    if (flicksArray) {
      flicksArray
        .reverse()
        .map(this.addFlick.bind(this))
    }
  }

  addFlick(flick) {
    const listItem = this.renderListItem(flick)
    this.list
      .insertBefore(listItem, this.list.firstChild)

    if (flick.id > this.max) {
      this.max = flick.id
    }

    this.flicks.unshift(flick)
    this.save()
  }

  addFlickViaForm(ev) {
    ev.preventDefault()
    const f = ev.target
    const flick = {
      id: this.max + 1,
      name: f.flickName.value,
    }

    this.addFlick(flick)

    f.reset()
  }

  save() {
    localStorage
      .setItem('flicks', JSON.stringify(this.flicks))

  }

  renderListItem(flick) {
    const item = this.template.cloneNode(true)
    item.classList.remove('template')
    item.dataset.id = flick.id
    item
      .querySelector('.flick-name')
      .textContent = flick.name

    if(flick.fav) {
      item.classList.add('fav')
    }

    item
      .querySelector('.flick-name')
      .addEventListener('keypress', this.saveOnEnter.bind(this, flick))

    item
      .querySelector('button.remove')
      .addEventListener('click', this.removeFlick.bind(this))

    item
      .querySelector('button.move-up')
      .addEventListener('click', this.moveUp.bind(this, flick))

    item
      .querySelector('button.move-down')
      .addEventListener('click', this.moveDown.bind(this, flick))

    item
      .querySelector('button.fav')
      .addEventListener('click', this.favFlick.bind(this, flick))

    item
      .querySelector('button.edit')
      .addEventListener('click', this.edit.bind(this, flick))
    return item
  }

  removeFlick(ev) {
    const listItem = ev.currentTarget.closest('.flick')

    // Find the flick in the array, and remove it
    for (let i = 0; i < this.flicks.length; i++) {
      const currentId = this.flicks[i].id.toString()
      if (listItem.dataset.id === currentId) {
        this.flicks.splice(i, 1)
        break
      }
    }

    listItem.remove()
    this.save()
  }

  favFlick(flick, ev) {
    const listItem = ev.currentTarget.closest('.flick')

    // listItem.classList.toggle('fav')
    // flick.fav = !flick.fav  //This will allow the method toggle to be used.

    //OR
    //Preferred way, more explicit.

    flick.fav = !flick.fav

    if (flick.fav) {
      listItem.classList.add('fav')
    }
    else {
      listItem.classList.remove('fav')
    }
    this.save()
  }

  moveUp(flick, ev) {
    const listItem = ev.currentTarget.closest('.flick')

    const index = this.flicks.findIndex((currentFlick, i) => {
      //Return true when it's the index we want - this way, we don't need a for loop. It will return -1 if the item is not in the array at all. If it was the first time, it will return 0.
      return currentFlick.id === flick.id
    })

    //This will make it so that the moveUp function will not call when it is the first item. This will not throw an error.
    if (index > 0) {
      this.list.insertBefore(listItem, listItem.previousElementSibling) //Use previousElementSibling in case there is a textbox between the elements. We want to target the elements.

      //Fix the array order
      const previousFlick = this.flicks[index - 1]
      this.flicks[index - 1] = flick
      this.flicks[index] = previousFlick
      this.save()
    }
  }

  moveDown(flick, ev) {
    const listItem = ev.currentTarget.closest('.flick')

    const index = this.flicks.findIndex((currentFlick, i) => {
      return currentFlick.id === flick.id
    })

    if (index < this.flicks.length - 1) //If it's not the last one
      this.list.insertBefore(listItem.nextElementSibling, listItem) //We're inserting what comes next, so nextElementSibling is used. And we'll move this up.

      const nextFlick = this.flicks[index + 1]
      this.flicks[index + 1] = flick
      this.flicks[index] = nextFlick
      this.save()
  }

  edit(flick, ev) {
    //We need the span, not the li to be editable.
    const listItem = ev.target.closest('.flick')
    const nameField = listItem.querySelector('.flick-name')
    const btn = listItem.querySelector('.edit.button')

    const icon = btn.querySelector('i.fa')

    if (nameField.isContentEditable) {
      // make it no longer editable
      nameField.contentEditable = false
      icon.classList.remove('fa-check')
      icon.classList.add('fa-pencil')
      btn.classList.remove('success')

      // save changes
      flick.name = nameField.textContent //We're actually editing textContent
      this.save()
    } else {
      nameField.contentEditable = true
      nameField.focus()
      icon.classList.remove('fa-pencil')
      icon.classList.add('fa-check')
      btn.classList.add('success')
    }
  }

  saveOnEnter(flick, ev) {
    if (ev.key === 'Enter') {
      this.edit(flick, ev)
    }
  }

}

const app = new App({
  formSelector: '#flick-form',
  listSelector: '#flick-list',
  templateSelector: '.flick.template',
})
