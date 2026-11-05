import type { FC } from 'react'
import { useWindowWidth } from '../../../shared/utils'
import { MobileHeader } from '../mobileHeader'
import { DesktopHeader } from '../desktopHeader'

export const Header: FC = () => {
	const { width } = useWindowWidth()

	if (width < 1135) return <MobileHeader />

	return <DesktopHeader />
}
