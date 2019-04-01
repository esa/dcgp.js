FROM mikeheddes/emsdk32

# Install eigen3 dependency
RUN apt-get -y update \
  && apt-get -y -qq install libeigen3-dev

WORKDIR /root
COPY ../patches ./patches

# boost
WORKDIR /root
RUN curl -L -o boost_1_68_0.tar.bz2 https://dl.bintray.com/boostorg/release/1.68.0/source/boost_1_68_0.tar.bz2 \
  && tar --bzip2 -xf ./boost_1_68_0.tar.bz2 \
  && cd ./boost_1_68_0 \
  && ./bootstrap.sh \
  && sed -i 's|using gcc ;|using gcc : : '"$(which em++ | tr -d [:space:])"' ;|g' project-config.jam \
  && ./b2 variant=release threading=single \
  --with-timer --with-chrono --with-serialization --with-system \
  --with-test --with-iostreams --with-regex install || exit 0

# gmp
WORKDIR /root
RUN curl -L -o gmp_6_1_2.tar.bz2 https://gmplib.org/download/gmp/gmp-6.1.2.tar.bz2 \
  && tar --bzip2 -xf ./gmp_6_1_2.tar.bz2 \
  && cd gmp-6.1.2 \
  && CC_FOR_BUILD=/usr/bin/gcc emconfigure ./configure --build i686-pc-linux-gnu \
  --host none --disable-assembly --enable-cxx \
  && patch config.h -i ../patches/gmp/config.h.diff \
  && emmake make install

# mpfr
WORKDIR /root
RUN curl -L -o mpfr-4.0.1.tar.bz2 https://www.mpfr.org/mpfr-4.0.1/mpfr-4.0.1.tar.bz2 \
  && tar --bzip2 -xf ./mpfr-4.0.1.tar.bz2 \
  && mkdir ./patches/mpfr \
  && curl -L -o ./patches/mpfr/mpfr-4.0.1-allpatches https://www.mpfr.org/mpfr-4.0.1/allpatches \
  && cd mpfr-4.0.1 \
  && patch -N -Z -p1 < ../patches/mpfr/mpfr-4.0.1-allpatches \
  && emconfigure ./configure --build i686-pc-linux-gnu \
  --host none --with-gmp-include=/usr/local/include/ --with-gmp-lib=/usr/local/lib \
  && emmake make install

# mp++
WORKDIR /root
RUN git clone https://github.com/bluescarni/mppp.git \
  && cd mppp \
  && git checkout tags/v0.9 \
  && mkdir build && cd build \
  && emconfigure cmake .. -DMPPP_WITH_MPFR=ON -DGMP_INCLUDE_DIR=/usr/local/include/gmp \
  -DGMP_LIBRARY=/usr/local/lib -DMPFR_INCLUDE_DIR=/usr/local/include/mpfr \
  -DMPFR_LIBRARY=/usr/local/lib \
  && emmake make install

# piranha
WORKDIR /root
RUN git clone https://github.com/mikeheddes/piranha.git \
  && mkdir piranha/build && cd piranha/build \
  && git checkout feat/add-single-thread-option \
  && patch ../CMakeLists.txt -i ../../patches/piranha/CMakeLists.txt.diff \
  && patch ../cmake_modules/PiranhaCompilerLinkerSettings.cmake \
  -i ../../patches/piranha/PiranhaCompilerLinkerSettings.cmake.diff \
  && patch ../cmake_modules/PiranhaPlatformSettings.cmake \
  -i ../../patches/piranha/PiranhaPlatformSettings.cmake.diff \
  && emconfigure cmake .. -DGMP_INCLUDE_DIR=/usr/local/include \
  -DMPFR_INCLUDE_DIR=/usr/local/include -DMPFR_LIBRARIES=/usr/local/lib \
  -DGMP_LIBRARIES=/usr/local/lib -DBoost_INCLUDE_DIR=/usr/local/include \
  -DBoost_LIBRARY_DIR_RELEASE=/usr/local/lib \
  && emmake make install

# audi
WORKDIR /root
RUN git clone https://github.com/darioizzo/audi.git \
  && mkdir audi/build && cd audi/build \
  && git checkout tags/1.6.1 \
  && patch ../CMakeLists.txt -i ../../patches/audi/CMakeLists.txt.diff \
  && emconfigure cmake .. -DBoost_INCLUDE_DIR=/usr/local/include \
  -DBoost_LIBRARY_DIR=/usr/local/lib -DEIGEN3_INCLUDE_DIR=/usr/include/eigen3 \
  -DPiranha_INCLUDE_DIR=/usr/local/include -DGMP_INCLUDE_DIR=/usr/local/include \
  -DGMP_LIBRARY=/usr/local/lib -DMPFR_INCLUDE_DIR=/usr/local/include \
  -DMPFR_LIBRARY=/usr/local/lib -DAUDI_BUILD_TESTS=OFF \
  && emmake make install

# dcgp
WORKDIR /root
RUN git clone https://github.com/darioizzo/dcgp.git \
  && mkdir dcgp/build && cd dcgp/build \
  && git checkout dead0689a4dba6bc7bf1ad748c6065accb130b8a \
  && patch ../CMakeLists.txt -i ../../patches/dcgp/CMakeLists.txt.diff \
  && emconfigure cmake .. -DDCGP_SINGLE_THREAD=ON -DDCGP_BUILD_TESTS=OFF \
  -DBoost_INCLUDE_DIR=/usr/local/include -DBoost_LIBRARY_DIR_RELEASE=/usr/local/lib \
  -DEIGEN3_INCLUDE_DIR=/usr/include/eigen3/ -DPiranha_INCLUDE_DIR=/usr/local/include/ \
  -DGMP_INCLUDE_DIR=/usr/local/include/ -DGMP_LIBRARY=/usr/local/lib/ \
  -DMPFR_INCLUDE_DIR=/usr/local/include/ -DMPFR_LIBRARY=/usr/local/lib/ \
  -DAUDI_INCLUDE_DIRS=/usr/local/include/ \
  && emmake make install

WORKDIR /

CMD ["/bin/bash"]
