const Rooms = require('../models/rooms');

exports.insert = async (req, res) => {
  let userData = req.body;
  if (userData == null) {
    res.status(403).send('No data sent!')
  }
  const result = await Rooms.exists({roomNo: userData.roomNo})
  if (!result) {
    try {
      let room = new Rooms({
        roomNo: userData.roomNo,
        imageData: userData.imageData,
      });
      await room.save();
      res.status(200).send({msg: 'add'})
    } catch (e) {
      res.status(500).send('error ' + e);
    }
  } else {
    await Rooms.updateOne({
      roomNo: userData.roomNo
    }, {
      roomNo: userData.roomNo,
      imageData: userData.imageData,
    })
    res.status(200).send({msg: 'update'})
  }
}

exports.get = async (req, res) => {
  const params = req.params
  console.log(params.roomNo)
  const data = await Rooms.find({roomNo: params.roomNo})
  res.status(200).send(JSON.stringify(data[0]));
}
