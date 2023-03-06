export const MetaStyle = {
  width: '100%',
  color: '$thTextSubtle2',
  fontSize: '13px',
  fontWeight: '400',
  fontFamily: '$display',
}

export const MenuStyle = {
  display: 'flex',
  marginLeft: 'auto',
  height: '30px',
  width: '30px',
  mt: '-5px',
  mr: '-5px',
  pt: '2px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1000px',
  '&:hover': {
    bg: '#EBEBEB',
  },
}

export const TitleStyle = {
  color: '$thTextContrast2',
  fontSize: '16px',
  fontWeight: '700',
  lineHeight: '1.25',
  fontFamily: '$display',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-word',
  display: '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical',
}

export const DescriptionStyle = {
  color: '$thTextSubtle',
  pt: '10px',
  fontSize: '13px',
  fontWeight: '400',
  lineHeight: '140%',
  fontFamily: '$display',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical',
  height: '45px',
  alignItems: 'start',
}

export const AuthorInfoStyle = {
  maxLines: '1',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '240px',
  overflow: 'hidden',
  height: '21px',
  color: '$thTextSubtle3',
  fontSize: '13px',
  fontWeight: '400',
  fontFamily: '$display',
}
