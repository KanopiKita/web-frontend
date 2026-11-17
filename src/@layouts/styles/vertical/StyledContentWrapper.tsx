'use client'

// Third-party Imports
import styled from '@emotion/styled'

// Util Imports
import { commonLayoutClasses, verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledContentWrapper = styled.div`
  min-block-size: 100dvh;
  flex: 1 1 0%;
  min-inline-size: 0;
  overflow-x: clip;

  &:has(.${verticalLayoutClasses.content}>.${commonLayoutClasses.contentHeightFixed}) {
    max-block-size: 100dvh;
    overflow: hidden;
  }
`

export default StyledContentWrapper
