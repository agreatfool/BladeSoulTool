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

BstConst.PATH_DATABASE = path.join(process.cwd(), 'database');

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

BstConst.LIST_FILE_SKELETON_COSTUME_WITH_ATTACHMENT = 'list_skeleton_costume_with_attachment.json';
BstConst.LIST_FILE_SKELETON_WEAPON = 'list_skeleton_weapon.json';
BstConst.LIST_FILE_SKELETON_HAIR = 'list_skeleton_hair.json';
BstConst.LIST_FILE_SKELETON_UNRECOGNIZED = 'list_skeleton_unrecognized.json';
BstConst.LIST_FILE_TEXTURE = 'list_texture.json';
BstConst.LIST_FILE_MATERIAL = 'list_material.json';
BstConst.LIST_FILE_UNRECOGNIZED = 'list_unrecognized.json';

BstConst.RAW_FILE_ICON = 'raw_icon.json';
BstConst.RAW_FILE_ICON_INVALID = 'raw_icon_invalid.json';
BstConst.RAW_FILE_SKELETON = 'raw_skeleton.json';
BstConst.RAW_FILE_SKELETON_INVALID = 'raw_skeleton_invalid.json';
BstConst.RAW_FILE_TEXTURE = 'raw_texture.json';
BstConst.RAW_FILE_MATERIAL = 'raw_material.json';
BstConst.RAW_FILE_MATERIAL_INVALID = 'raw_material_invalid.json';

BstConst.UPK_INVALID_UPK_IDS = [
    '00002620', // 常见于costume类型数据中：core：Material3 Basic
    '00005708', // 常见于attach类型数据中：obj：D, S, glasses3_m
    '00008613', // 常见于attach, weapon类型数据中：core：NothingMAT
    '00012963', // 大量无用obj
    '00005708', // 眼镜上的glasses obj
    '00002640'  // 大量材质相关obj
];

//------------------------------------------------------------------------
//- ICON
//------------------------------------------------------------------------
BstConst.ICON_UPK_ID = '00008758';
BstConst.PATH_ICON_BASE = 'database/icon';
BstConst.PATH_ICON_TGA = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'tga');
BstConst.PATH_ICON_PNG = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'png');
BstConst.PATH_ICON_PNG_CPS = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'png-cps');

module.exports = BstConst;