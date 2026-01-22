import { useNavigate, useRouteError } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import { ROUTES } from '@/shared/constants'

export function ErrorPage() {
  const error = useRouteError() as {
    message?: string
    data?: { message?: string }
    status?: string | number
    statusText?: string
  }
  const navigate = useNavigate()

  const errorMessage = error?.message || error?.data?.message || '알 수 없는 오류가 발생했습니다.'
  const errorStatus = error?.status || error?.statusText

  const handleGoHome = () => {
    navigate(ROUTES.NICKNAME_SETUP)
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card p-8">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorStatus ? `${errorStatus} 오류` : '페이지 오류'}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="btn-primary w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </button>

            <button
              onClick={handleGoBack}
              className="btn-secondary w-full"
            >
              이전 페이지로
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <p className="text-gray-500 text-sm mt-6">
          문제가 계속 발생하면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
        </p>
      </div>
    </div>
  )
}

export default ErrorPage