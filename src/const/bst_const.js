"use strict";

var path = require('path');

var BstConst = function() {};

//------------------------------------------------------------------------
//- GLOBAL
//------------------------------------------------------------------------
BstConst.PART_BODY = 'body';
BstConst.PART_FACE = 'face';
BstConst.PART_HAIR = 'hair';

BstConst.BACKUP_TAIL = '.bst_bak';

//------------------------------------------------------------------------
//- UPK
//------------------------------------------------------------------------
BstConst.UPK_NO_OBJ_ERROR = 'Specified package(s) has no supported objects';
BstConst.UPK_UNKNOWN_MEMBER_ERROR = '*** unknown member';

BstConst.UPK_ENTRANCE_LINE_NO = 2; // 一般来说，log的第三行里的内容是关键信息
BstConst.UPK_TYPE_SKELETON = 'SkeletalMesh3';
BstConst.UPK_TYPE_TEXTURE  = 'Texture2D';
BstConst.UPK_TYPE_MATERIAL = 'MaterialInstanceConstant';

BstConst.PATH_UPK_BASE = 'database/upk';
BstConst.PATH_UPK_LOG = path.join(process.cwd(), BstConst.PATH_UPK_BASE, 'log');
BstConst.PATH_UPK_DATA_LIST = path.join(process.cwd(), BstConst.PATH_UPK_BASE, 'data/list');
BstConst.PATH_UPK_DATA_RAW = path.join(process.cwd(), BstConst.PATH_UPK_BASE, 'data/raw');

//------------------------------------------------------------------------
//- ICON
//------------------------------------------------------------------------
BstConst.ICON_UPK_ID = '00008758';
BstConst.PATH_ICON_BASE = 'database/icon';
BstConst.PATH_ICON_TGA = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'tga');
BstConst.PATH_ICON_PNG = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'png');

module.exports = BstConst;