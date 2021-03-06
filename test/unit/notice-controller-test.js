const assert = require('assert')
const configManagerGen = require('../lib/mock-config-manager')
const NoticeController = require('../../app/scripts/notice-controller')

describe('notice-controller', function () {
  var noticeController

  beforeEach(function () {
    // simple localStorage polyfill
    const configManager = configManagerGen()
    noticeController = new NoticeController({
      configManager: configManager,
    })
  })

  describe('notices', function () {
    describe('#getNoticesList', function () {
      it('should return an empty array when new', function (done) {
        // const testList = [{
        //   id: 0,
        //   read: false,
        //   title: 'Futuristic Notice',
        // }]
        var result = noticeController.getNoticesList()
        assert.equal(result.length, 0)
        done()
      })
    })

    describe('#setNoticesList', function () {
      it('should set data appropriately', function (done) {
        var testList = [{
          id: 0,
          read: false,
          title: 'Futuristic Notice',
        }]
        noticeController.setNoticesList(testList)
        var testListId = noticeController.getNoticesList()[0].id
        assert.equal(testListId, 0)
        done()
      })
    })

    describe('#updateNoticeslist', function () {
      it('should integrate the latest changes from the source', function (done) {
        var testList = [{
          id: 55,
          read: false,
          title: 'Futuristic Notice',
        }]
        noticeController.setNoticesList(testList)
        noticeController.updateNoticesList().then(() => {
          var newList = noticeController.getNoticesList()
          assert.ok(newList[0].id === 55)
          assert.ok(newList[1])
          done()
        })
      })
      it('should not overwrite any existing fields', function (done) {
        var testList = [{
          id: 0,
          read: false,
          title: 'Futuristic Notice',
        }]
        noticeController.setNoticesList(testList)
        var newList = noticeController.getNoticesList()
        assert.equal(newList[0].id, 0)
        assert.equal(newList[0].title, 'Futuristic Notice')
        assert.equal(newList.length, 1)
        done()
      })
    })

    describe('#markNoticeRead', function () {
      it('should mark a notice as read', function (done) {
        var testList = [{
          id: 0,
          read: false,
          title: 'Futuristic Notice',
        }]
        noticeController.setNoticesList(testList)
        noticeController.markNoticeRead(testList[0])
        var newList = noticeController.getNoticesList()
        assert.ok(newList[0].read)
        done()
      })
    })

    describe('#getLatestUnreadNotice', function () {
      it('should retrieve the latest unread notice', function (done) {
        var testList = [
          {id: 0, read: true, title: 'Past Notice'},
          {id: 1, read: false, title: 'Current Notice'},
          {id: 2, read: false, title: 'Future Notice'},
        ]
        noticeController.setNoticesList(testList)
        var latestUnread = noticeController.getLatestUnreadNotice()
        assert.equal(latestUnread.id, 2)
        done()
      })
      it('should return undefined if no unread notices exist.', function (done) {
        var testList = [
          {id: 0, read: true, title: 'Past Notice'},
          {id: 1, read: true, title: 'Current Notice'},
          {id: 2, read: true, title: 'Future Notice'},
        ]
        noticeController.setNoticesList(testList)
        var latestUnread = noticeController.getLatestUnreadNotice()
        assert.ok(!latestUnread)
        done()
      })
    })
  })
})
